const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const queryRoles =
`SELECT 
  CONCAT(id) AS value,
  CONCAT(title, ': salary: ', salary) AS name
FROM
  role;`;

const queryEmployees = 
`SELECT 
  CONCAT(id) AS value,
  COCNAT(first_name, ' ', last_name) AS name
FROM
  employee;`;

const queryDepartment = 
`SELECT 
CONCAT(id) AS value,
name
FROM
department
ORDER BY id;`;

const queryManager = 
`SELECT DISTINCT
CONCAT(m.id) AS value,
CONCAT(m.first_name, ' ', m.last_name) AS name
FROM
employee m
    INNER JOIN
employee e ON m.id = e.manager_id
ORDER BY m.id;`;

function byDepartment() {
  connection.query('SELECT * FROM department ORDER BY id', (err, res)=>{
    if (err) throw err;
    inquirer
      .prompt([
      {
        type: 'rawlist',
        name: 'dept',
        choices(){
          const deptList = JSON.parse(JSON.stringify(res));
          return deptList;
        },
        message: 'Select a department.'
      }
      ])
      .then(answer =>{
        const query =
         `SELECT 
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title,
            role.salary,
            CONCAT(department.name) AS department
          FROM
            employee
              INNER JOIN
            role ON employee.role_id = role.id
              LEFT JOIN
            department ON role.department_id = department.id
          WHERE
            department.name = ?
          ORDER BY employee.id;`;

          connection.query(query, [answer.dept], (err, res) =>{
            if(err) throw err;
            const table =cTable.getTable(res);            
            console.log('\n'+table);
          });

          main();
      })
  });
}

function viewAllEmplyees (){
  const query = `SELECT e.id, e.first_name, e.last_name, concat(department.name) as department, role.title, role.salary, CONCAT(m.first_name,' ', m.last_name) AS Manager FROM employee e INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id left JOIN employee m ON e.manager_id = m.id order by e.id;`;
  connection.query(query, (err, res) =>{
    if(err){
      console.error('something wrong');
    }
    console.log('\n');
    const table = cTable.getTable(res);
    console.log(table);
    console.log('\n');
  });
  main();
}

function byManager(){
  const managerQuery = 
  `SELECT 
    CONCAT(id) AS value,
    CONCAT(first_name, ' ', last_name) AS name
  FROM
    employee
  where manager_id IS NULL`;
  
  connection.query(managerQuery, (err, res) => {
    if (err) throw err;
    
    inquirer
      .prompt({
        type: 'list',
        name: 'manager',
        messager: 'Which manager?',
        choices(){
          const mList = JSON.parse(JSON.stringify(res));
          return mList;
        }
      })
      .then(answer =>{
        console.log(answer.manager);
        const query = 
          `SELECT 
              e.id,
              e.first_name,
              e.last_name,
              CONCAT(department.name) AS department,
              role.title,
              role.salary,
              CONCAT(m.first_name, ' ', m.last_name) AS Manager
          FROM
              employee e
                  INNER JOIN
              role ON e.role_id = role.id
                  INNER JOIN
              department ON role.department_id = department.id
                  LEFT JOIN
              employee m ON e.manager_id = m.id
          WHERE
              e.manager_id = ?
          ORDER BY 
            e.id;`;

        connection.query(query, [answer.manager], (err, res) =>{
          if (err) throw err;
          const table =cTable.getTable(res);            
          console.log('\n'+table+'\n');
        });
      });
  });
  main();
}

async function addEmployee(){

  let newEmployee = [null, null, null, null];
  
  const eName = await inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'Enter employee first name.'
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'Enter last name',
    },
  ]);
  console.log(eName);
  newEmployee[0] = eName.first_name;
  newEmployee[1] = eName.last_name;

  connection.query(queryRoles, (err, res)=>{
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'role',
          message: 'choose a role for this employee.',
          choices(){
            const mList = JSON.parse(JSON.stringify(res));
            return mList;
          }
        }
      ])
      .then(answer =>{
        console.log(answer);
         newEmployee[2] = answer.role;

         connection.query(queryManager, (err, result) =>{
           inquirer
            .prompt([
              {
                type: 'list',
                name: 'manager',
                message: 'choose a manager for this employee.',
                choices () {
                  const list = JSON.parse(JSON.stringify(result));
                  return list;
                }
              }
            ])
            .then (ans =>{
              console.log(ans);
              newEmployee[3] = ans.manager;
              console.log(newEmployee);
              const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
              VALUES (?, ?, ?, ?);`
              connection.query(query, newEmployee, (err, res)=>{
                if (err) throw err;
                console.log('New employee added');
                main();
              });
              main();
            });
         });
      });
    });
  //main();
}

async function removeEmployee() {

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee',
      message: 'Delete which employee?',
      choices(){
        const list = getEmployees();
        return list;
      }

    }
  ])


}

async function updateRole(){}

async function updateManager(){}

function allRoles(){
    connection.query(queryRoles, (err, res)=>{
      if (err) throw err;
      const table =cTable.getTable(res);            
      console.log('\n'+table+'\n');
    });

  return main();
}

async function addRole(){

}

async function removeRole(){}

function allDept(){
  connection.query(queryDepartment, (err, res)=>{
    if (err) throw err;
    const table =cTable.getTable(res);            
    console.log('\n'+table+'\n');
  });
  return main();
}

async function addDept(){

}

async function removeDept(){}

async function main() {
  const answer = await inquirer.prompt({
    type : 'list',
    name: 'options',
    message: 'What would you like to do?',
    choices: [
      "View All Employees",
      "View All Employees By Department",
      "View All Employees By Manager",
      "Add Employee",
      "Remove Employee",
      "Update Employee Role",
      "Update Employee Manager",
      "View All Roles",
      "Add Role",
      "Remove Role",
      "View All Departments",
      "Add Departments",
      "Remove Depoartments",
      "View Total Utilized Budget By Department",
      "Exit"
    ]
  });
  
  switch (answer.options) {
    case "View All Employees":
      viewAllEmplyees();
      break;
    case "View All Employees By Department":
      byDepartment();
      break;
    case "View All Employees By Manager":
      byManager();
      break;
    case "Add Employee":
      addEmployee();
      break;
    case "Remove Employee":
      removeEmployee();
      break;
    case "Update Employee Role":
      updateRole()
      break;
    case "Update Employee Manager":
      updateManager();
      break;
    case "View All Roles":
      allRoles();
      break;
    case "Add Role":
      addRole()
      break;
    case "Remove Role":
      removeRole();
      break;

    case "View All Departments":
      allDept();
      break;
    case "Add Departments":
      addDept();
      break;
    case "Remove Depoartments":
      removeDept();
      break;
    case "View Total Utilized Budget By Department":
      totalBudget();        
      break;
    case "Exit":
      process.exit();

    default:
      start();
      break;
  }
}

connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);

    main();

});