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

async function byDepartment() {
  var deptList;
  connection.query('SELECT * FROM department ORDER BY id', (err, res)=>{
    deptList = res;
  });
  const answer = await inquirer.prompt({
    type: 'list',
    name: 'dept',
    message: 'Which department?',
    choices: deptList
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
  })

  main();
}

async function byManager(){

  const answer = await inquirer.prompt({
    type: 'list',
    name: 'manager',
    messager: 'Which manager?',
    choices: []
  });
}

async function addEmployee(){
  const answer = await inquirer.prompt({
    type: 'text'
  })
}

async function removeEmployee() {

}

async function updateRole(){}

async function updateManager(){}

async function addRole(){}

async function removeRole(){}

async function addDept(){}

async function romoveDept(){}

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

  //console.log(answer);
  
  switch (answer.options) {
    case "View All Employees":
      viewAllEmplyees();
      break;
    case "View All Employees By Department":
      
      break;
    case "View All Employees By Manager":
      
      break;
    case "Add Employee":
      
      break;
    case "Remove Employee":
      
      break;
    case "Update Employee Role":
        
      break;
    case "Update Employee Manager":
          
      break;
    case "View All Roles":
      break;
    case "Add Role":
      break;
    case "Remove Role":
      break;

    case "View All Departments":
      break;
    case "Add Departments":
      break;
    case "Remove Depoartments":
      break;
    case "View Total Utilized Budget By Department":
        
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