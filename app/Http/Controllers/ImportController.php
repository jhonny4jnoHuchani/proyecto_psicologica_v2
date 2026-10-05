<?php

namespace App\Http\Controllers;

use App\Exports\PlantillaEstudiantesExport;
use App\Imports\EstudiantesImport;
use App\Models\Curso;
use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ImportController extends Controller
{
    public function plantilla(): BinaryFileResponse
    {
        return Excel::download(
            new PlantillaEstudiantesExport(),
            'plantilla_estudiantes.xlsx'
        );
    }

    public function preview(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls|max:5120',
            'curso_id' => 'required|exists:cursos,id',
        ]);

        try {
            $curso = Curso::with('gestion')->findOrFail($request->curso_id);

            $import = new EstudiantesImport();
            Excel::import($import, $request->file('archivo'));

            $filas = $import->filas;

            if ($filas->isEmpty()) {
                return response()->json([
                    'error' => 'El archivo está vacío o no se pudo leer.',
                ], 422);
            }

            $inscritos = $curso->estudiantes()->wherePivot('estado', 'activo')->count();
            $cupoDisponible = max(0, $curso->cupos - $inscritos);

            $cisEnArchivo = [];
            $emailsEnArchivo = [];

            $resultado = [];
            $validos = 0;
            $errores = 0;

            foreach ($filas as $index => $fila) {
                $numeroFila = $index + 2;
                $erroresFila = [];

                $nombre = trim((string) ($fila['nombre'] ?? ''));
                $apellidoPaterno = trim((string) ($fila['apellido_paterno'] ?? ''));
                $apellidoMaterno = trim((string) ($fila['apellido_materno'] ?? ''));
                $ci = trim((string) ($fila['ci'] ?? ''));
                $celular = trim((string) ($fila['celular'] ?? ''));
                $email = trim((string) ($fila['email'] ?? ''));
                $genero = trim((string) ($fila['genero'] ?? ''));
                $fechaNacimiento = trim((string) ($fila['fecha_nacimiento'] ?? ''));
                $direccion = trim((string) ($fila['direccion'] ?? ''));
                $colegio = trim((string) ($fila['colegio_procedencia'] ?? ''));
                $tipoInscripcion = trim((string) ($fila['tipo_inscripcion'] ?? ''));

                if ($nombre === '') $erroresFila[] = 'nombre vacío';
                if ($apellidoPaterno === '') $erroresFila[] = 'apellido paterno vacío';
                if ($apellidoMaterno === '') $erroresFila[] = 'apellido materno vacío';
                if ($ci === '') $erroresFila[] = 'CI vacío';
                if ($celular === '') $erroresFila[] = 'celular vacío';
                if ($email === '') $erroresFila[] = 'email vacío';

                if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $erroresFila[] = 'email inválido';
                }
                if ($genero !== '' && !in_array($genero, ['M', 'F', 'Otro'])) {
                    $erroresFila[] = 'género inválido';
                }
                if ($tipoInscripcion !== '' && !in_array($tipoInscripcion, ['regular', 'dispensacion', 'cursillo'])) {
                    $erroresFila[] = 'tipo inscripción inválido';
                }

                if ($ci !== '' && in_array($ci, $cisEnArchivo)) {
                    $erroresFila[] = 'CI duplicado en el archivo';
                }
                if ($email !== '' && in_array($email, $emailsEnArchivo)) {
                    $erroresFila[] = 'email duplicado en el archivo';
                }
                if ($ci !== '' && User::where('ci', $ci)->exists()) {
                    $erroresFila[] = 'CI ya existe en el sistema';
                }
                if ($email !== '' && User::where('email', $email)->exists()) {
                    $erroresFila[] = 'email ya existe en el sistema';
                }

                $esValido = empty($erroresFila);

                if ($esValido) {
                    $validos++;
                    $cisEnArchivo[] = $ci;
                    $emailsEnArchivo[] = $email;
                } else {
                    $errores++;
                }

                $resultado[] = [
                    'fila' => $numeroFila,
                    'nombre' => $nombre,
                    'apellido_paterno' => $apellidoPaterno,
                    'apellido_materno' => $apellidoMaterno,
                    'ci' => $ci,
                    'celular' => $celular,
                    'email' => $email,
                    'genero' => $genero ?: null,
                    'fecha_nacimiento' => $fechaNacimiento ?: null,
                    'direccion' => $direccion ?: null,
                    'colegio_procedencia' => $colegio ?: null,
                    'tipo_inscripcion' => $tipoInscripcion ?: null,
                    'valido' => $esValido,
                    'errores' => $erroresFila,
                ];
            }

            return response()->json([
                'preview' => [
                    'total' => count($resultado),
                    'validos' => $validos,
                    'errores' => $errores,
                    'curso_id' => $curso->id,
                    'curso_label' => "{$curso->gestion->año} - {$curso->gestion->etapa} | Paralelo {$curso->paralelo}",
                    'cupo_disponible' => $cupoDisponible,
                    'filas' => $resultado,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'No se pudo leer el archivo: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'filas' => 'required|array|min:1',
            'filas.*.nombre' => 'required|string|max:100',
            'filas.*.apellido_paterno' => 'required|string|max:100',
            'filas.*.apellido_materno' => 'required|string|max:100',
            'filas.*.ci' => 'required|string|max:20|unique:users,ci',
            'filas.*.celular' => 'required|string|max:20',
            'filas.*.email' => 'required|email|max:255|unique:users,email',
            'filas.*.genero' => 'nullable|in:M,F,Otro',
            'filas.*.fecha_nacimiento' => 'nullable|date',
            'filas.*.direccion' => 'nullable|string|max:255',
            'filas.*.colegio_procedencia' => 'nullable|string|max:150',
            'filas.*.tipo_inscripcion' => 'nullable|in:regular,dispensacion,cursillo',
        ]);

        $creados = [];

        DB::transaction(function () use ($request, &$creados) {
            $curso = Curso::where('id', $request->curso_id)
                ->where('estado', 'activo')
                ->lockForUpdate()
                ->firstOrFail();

            $inscritos = $curso->estudiantes()->wherePivot('estado', 'activo')->count();
            $nuevos = count($request->filas);

            if ($inscritos + $nuevos > $curso->cupos) {
                $disponibles = $curso->cupos - $inscritos;
                throw ValidationException::withMessages([
                    'curso_id' => "El curso solo tiene {$disponibles} cupos disponibles.",
                ]);
            }

            foreach ($request->filas as $fila) {
                $password = Str::random(10);

                $user = User::create([
                    'nombre' => $fila['nombre'],
                    'apellido_paterno' => $fila['apellido_paterno'],
                    'apellido_materno' => $fila['apellido_materno'],
                    'ci' => $fila['ci'],
                    'celular' => $fila['celular'],
                    'email' => $fila['email'],
                    'password' => bcrypt($password),
                    'genero' => $fila['genero'] ?? null,
                    'fecha_nacimiento' => $fila['fecha_nacimiento'] ?? null,
                    'direccion' => $fila['direccion'] ?? null,
                ]);

                $estudiante = Estudiante::create([
                    'user_id' => $user->id,
                    'colegio_procedencia' => $fila['colegio_procedencia'] ?? null,
                    'tipo_inscripcion' => $fila['tipo_inscripcion'] ?? null,
                ]);

                $estudiante->cursos()->attach($curso->id, [
                    'fecha_inscripcion' => today(),
                    'estado' => 'activo',
                ]);

                $user->assignRole('estudiante');

                $creados[] = [
                    'nombre' => "{$user->apellido_paterno} {$user->apellido_materno}, {$user->nombre}",
                    'email' => $user->email,
                    'password' => $password,
                ];
            }
        });

        return redirect()->route('estudiantes.index')
            ->with('success', count($creados) . ' estudiantes importados correctamente.');
    }
}