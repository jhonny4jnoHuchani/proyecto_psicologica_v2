<?php

namespace Database\Seeders;

use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Database\Seeder;

class EstudianteSeeder extends Seeder
{
    public function run(): void
    {
        $estudiantes = [
            [
                'user' => [
                    'nombre' => 'Juan',
                    'apellido_paterno' => 'Pérez',
                    'apellido_materno' => 'García',
                    'ci' => '8377246 LP',
                    'celular' => '76543300',


                    'email' => 'juan.perez@email.com',
                    'password' => bcrypt('password'),


                    'genero' => 'M',
                    'fecha_nacimiento' => '2005-03-15',
                    'direccion' => 'Av. Sucre B, Zona Villa Esperanza',
                ],
                'colegio_procedencia' => 'U.E. San Andrés',
                'tipo_inscripcion' => 'regular',
            ],
            [
                'user' => [
                    'nombre' => 'María',
                    'apellido_paterno' => 'Quispe',
                    'apellido_materno' => 'Mamani',
                    'ci' => '9378246 LP',
                    'celular' => '76543301',


                    'email' => 'maria.quispe@email.com',
                    'password' => bcrypt('password'),

                    
                    'genero' => 'F',
                    'fecha_nacimiento' => '2004-07-22',
                    'direccion' => 'Calle 5, Zona 16 de Julio',
                ],
                'colegio_procedencia' => 'U.E. Bolivia',
                'tipo_inscripcion' => 'regular',
            ],
            [
                'user' => [
                    'nombre' => 'Luis',
                    'apellido_paterno' => 'Choque',
                    'apellido_materno' => 'Flores',
                    'ci' => '10378246 LP',
                    'celular' => '76543302',
                    'email' => 'luis.choque@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2006-11-08',
                    'direccion' => 'Av. Tiahuanaco, Zona Norte',
                ],
                'colegio_procedencia' => 'U.E. Franz Tamayo',
                'tipo_inscripcion' => 'dispensacion',
            ],
            [
                'user' => [
                    'nombre' => 'Sofía',
                    'apellido_paterno' => 'Condori',
                    'apellido_materno' => 'Apaza',
                    'ci' => '11378246 LP',
                    'celular' => '76543303',
                    'email' => 'sofia.condori@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2005-09-30',
                    'direccion' => 'Calle 3, Zona Villa Adela',
                ],
                'colegio_procedencia' => 'U.E. San Andrés',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Carlos',
                    'apellido_paterno' => 'Mamani',
                    'apellido_materno' => 'Lima',
                    'ci' => '12378246 LP',
                    'celular' => '76543304',
                    'email' => 'carlos.mamani2@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2005-02-10',
                    'direccion' => 'Calle 8, Zona El Alto',
                ],
                'colegio_procedencia' => 'U.E. Bolívar',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Ana',
                    'apellido_paterno' => 'Torrez',
                    'apellido_materno' => 'Vargas',
                    'ci' => '13378246 LP',
                    'celular' => '76543305',
                    'email' => 'ana.torrez@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2004-11-03',
                    'direccion' => 'Av. América, Zona Central',
                ],
                'colegio_procedencia' => 'U.E. Ayacucho',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Diego',
                    'apellido_paterno' => 'Huanca',
                    'apellido_materno' => 'Rojas',
                    'ci' => '14378246 LP',
                    'celular' => '76543306',
                    'email' => 'diego.huanca@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2006-05-18',
                    'direccion' => 'Calle 12, Zona Sur',
                ],
                'colegio_procedencia' => 'U.E. San Martín',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Lucía',
                    'apellido_paterno' => 'Apaza',
                    'apellido_materno' => 'Condori',
                    'ci' => '15378246 LP',
                    'celular' => '76543307',
                    'email' => 'lucia.apaza@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2005-08-24',
                    'direccion' => 'Av. 6 de Agosto',
                ],
                'colegio_procedencia' => 'U.E. Simón Bolívar',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Fernando',
                    'apellido_paterno' => 'Quispe',
                    'apellido_materno' => 'Torrico',
                    'ci' => '16378246 LP',
                    'celular' => '76543378',
                    'email' => 'fernando.quispe2@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2005-01-30',
                    'direccion' => 'Zona Chuquiaguillo',
                ],
                'colegio_procedencia' => 'U.E. Don Bosco',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Camila',
                    'apellido_paterno' => 'Mendoza',
                    'apellido_materno' => 'Paz',
                    'ci' => '17378246 LP',
                    'celular' => '76543328',
                    'email' => 'camila.mendoza@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2004-04-15',
                    'direccion' => 'Av. Busch, Miraflores',
                ],
                'colegio_procedencia' => 'U.E. Alemán',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Roberto',
                    'apellido_paterno' => 'Copa',
                    'apellido_materno' => 'Yujra',
                    'ci' => '18378246 LP',
                    'celular' => '670456987',
                    'email' => 'roberto.copa@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2006-07-09',
                    'direccion' => 'Calle Loayza',
                ],
                'colegio_procedencia' => 'U.E. La Salle',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Valeria',
                    'apellido_paterno' => 'Silva',
                    'apellido_materno' => 'Chávez',
                    'ci' => '19378246 LP',
                    'celular' => '76895463',
                    'email' => 'valeria.silva@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2005-12-01',
                    'direccion' => 'Zona Obrajes',
                ],
                'colegio_procedencia' => 'U.E. Franco Boliviano',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Andrés',
                    'apellido_paterno' => 'Vargas',
                    'apellido_materno' => 'Montaño',
                    'ci' => '20378246 LP',
                    'celular' => '76543312',
                    'email' => 'andres.vargas@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2005-06-22',
                    'direccion' => 'Av. Arce',
                ],
                'colegio_procedencia' => 'U.E. San Calixto',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Daniela',
                    'apellido_paterno' => 'Ramos',
                    'apellido_materno' => 'Gutiérrez',
                    'ci' => '21378246 LP',
                    'celular' => '76543313',
                    'email' => 'daniela.ramos@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2004-10-17',
                    'direccion' => 'Calle Jaén',
                ],
                'colegio_procedencia' => 'U.E. San Ignacio',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Gabriel',
                    'apellido_paterno' => 'Llanque',
                    'apellido_materno' => 'Calle',
                    'ci' => '22378246 LP',
                    'celular' => '76124569',
                    'email' => 'gabriel.llanque@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2006-03-28',
                    'direccion' => 'Zona Alto Lima',
                ],
                'colegio_procedencia' => 'U.E. Hugo Dávalos',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Patricia',
                    'apellido_paterno' => 'Salinas',
                    'apellido_materno' => 'Orellana',
                    'ci' => '23378246 LP',
                    'celular' => '76543325',
                    'email' => 'patricia.salinas@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2005-09-08',
                    'direccion' => 'Av. Camacho',
                ],
                'colegio_procedencia' => 'U.E. María Auxiliadora',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Mateo',
                    'apellido_paterno' => 'Chipana',
                    'apellido_materno' => 'Soto',
                    'ci' => '24378246 LP',
                    'celular' => '76543316',
                    'email' => 'mateo.chipana@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2005-11-12',
                    'direccion' => 'Zona Ciudad Satélite',
                ],
                'colegio_procedencia' => 'U.E. San José',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Isabella',
                    'apellido_paterno' => 'Cárdenas',
                    'apellido_materno' => 'Peña',
                    'ci' => '25378246 LP',
                    'celular' => '76543317',
                    'email' => 'isabella.cardenas@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2004-02-26',
                    'direccion' => 'Calle Comercio',
                ],
                'colegio_procedencia' => 'U.E. Santo Tomás',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Sebastián',
                    'apellido_paterno' => 'Machaca',
                    'apellido_materno' => 'Rivera',
                    'ci' => '26378246 LP',
                    'celular' => '76543318',
                    'email' => 'sebastian.machaca@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'M',
                    'fecha_nacimiento' => '2006-08-04',
                    'direccion' => 'Av. Montes',
                ],
                'colegio_procedencia' => 'U.E. Adventista',
                'tipo_inscripcion' => 'cursillo',
            ],
            [
                'user' => [
                    'nombre' => 'Renata',
                    'apellido_paterno' => 'Zárate',
                    'apellido_materno' => 'López',
                    'ci' => '27378246 LP',
                    'celular' => '76543256',
                    'email' => 'renata.zarate@email.com',
                    'password' => bcrypt('password'),
                    'genero' => 'F',
                    'fecha_nacimiento' => '2005-04-19',
                    'direccion' => 'Zona Achachicala',
                ],
                'colegio_procedencia' => 'U.E. Luperón',
                'tipo_inscripcion' => 'cursillo',
            ],

        ];

        foreach ($estudiantes as $estudiante) {
            $user = User::create($estudiante['user']);
            $user->assignRole('estudiante'); 
            Estudiante::create([
                'user_id' => $user->id,
                'colegio_procedencia' => $estudiante['colegio_procedencia'],
                'tipo_inscripcion' => $estudiante['tipo_inscripcion'],
            ]);
        }
    }
}