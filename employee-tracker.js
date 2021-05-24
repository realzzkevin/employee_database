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
  CONCAT(first_name, ' ', last_name) AS name
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
  const query = 
    `SELECT e.id, e.first_name, e.last_name, concat(department.name) as department, role.title, role.salary, CONCAT(m.first_name,' ', m.last_name) AS Manager
     FROM employee e INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id left JOIN employee m ON e.manager_id = m.id order by e.id;`;
  connection.query(query, (err, res) =>{
    if(err) throw err;
    const table = cTable.getTable(res);
    console.log('\n'+table+'\n');
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
}

function removeEmployee() {
  connection.query(queryEmployees, (err, res)=>{
    if(err) throw err;
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'id',
          message: 'Delete which employee?',
          choices(){
            const list = JSON.parse(JSON.stringify(res));
            return list;
          }  
        }
      ])
      .then(answer =>{
        const query = `DELETE FROM employee WHERE id = ?;`;
        connection.query(query, answer.id, (err, res)=>{
          if(err) throw err;
          console.log('Employee deleted.');
          main();
        });

      });
  });
}

function updateRole(){
  connection.query(queryEmployees, (err, res)=>{
    if(err) throw err;
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'e_id',
          message: 'Update role for which employee?',
          choices(){
            const list = JSON.parse(JSON.stringify(res));
            return list;
          }  
        }
      ])
      .then(answer =>{
        const temp =[];
        temp.push(answer.e_id);
        connection.query(queryRoles, (err, result)=>{
          if(err) throw err;
          inquirer
            .prompt([
              {
                type: 'list',
                name: 'r_id',
                message: 'Select a new role for the employee.',
                choices(){
                  const list = JSON.parse(JSON.stringify(result));
                  return list;
                }
              }
            ])
            .then(ans => {
              temp.push(ans.r_id);
              const query = `UPDATE employee SET role_id = ? WHERE id = ?;`;
              connection.query(query, [temp[1],temp[0]], (err, res)=>{
                if (err) throw err;
                connection.query(
                  `SELECT employee.first_name, employee.last_name, role.title FROM employee
                  LEFT JOIN role ON employee.role_id = role.id
                  WHERE id =?`,
                  temp[0],
                  (err, resu) =>{
                    const table =cTable.getTable(resu);            
                    console.log('\n'+table+'\n'); 
                    main();               
                });

              });
            });
        });
      });
  });
}

function updateManager(){
    connection.query(queryEmployees, (err, res)=>{
      if(err) throw err;
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'e_id',
            message: 'Update manager for which employee?',
            choices(){
              const list = JSON.parse(JSON.stringify(res));
              return list;
            }  
          }
        ])
        .then(answer =>{
          const temp =[];
          temp.push(answer.e_id);
          connection.query(queryManager, (err, result)=>{
            if(err) throw err;
            inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'm_id',
                  message: 'Select a manager for the employee.',
                  choices(){
                    const list = JSON.parse(JSON.stringify(result));
                    return list;
                  }
                }
              ])
              .then(ans => {
                temp.push(ans.m_id);
                const query = `UPDATE employee SET manager_id = ? WHERE id = ?;`;
                connection.query(query, [temp[1],temp[0]], (err, res)=>{
                  if (err) throw err;
                  const query2 = 
                    `SELECT 
                      e.first_name,
                      e.last_name,
                      CONCAT(m.first_name, ' ', m.last_name) AS manager
                    FROM
                      employee e
                        LEFT JOIN
                      employee m ON e.manager_id = m.id
                    WHERE
                      e.id = ?;`;

                  connection.query(query2, temp[0],(err, resu) =>{
                      const table =cTable.getTable(resu);            
                      console.log('\n'+table+'\n');
                      main();               
                  });
  
                });
            });
          });
        });
    });
}

function allRoles(){
    connection.query(queryRoles, (err, res)=>{
      if (err) throw err;
      const table =cTable.getTable(res);            
      console.log('\n'+table+'\n');
    });

  return main();
}

async function addRole(){
  const newRole = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'what is the tile of the new role?'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary of the new role?'
    },
  ]) 

  connection.query(queryDepartment, (err, res)=>{
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'dept_id',
          message: 'Choose a department for the new role.',
          choices (){
            const list = JSON.parse(JSON.stringify(res));
            return list;
          }
        }
      ])
      .then(answer =>{
        const query = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`;
        connection.query(
          query,
          [newRole.title, parseInt(newRole.salary), answer.dept_id],
          (err, res)=>{
            if (err) throw err;
            console.log(res.insterId);
            main();
          }
        )
      });
  }); 
}

function removeRole(){
  connection.query(queryRoles, (err, res)=>{
    if(err) throw err;
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'id',
          message: 'Choose a role to delete.',
          choices(){
            const list = JSON.parse(JSON.stringify(res));
            return list;
          }  
        }
      ])
      .then(answer =>{
        const query = `DELETE FROM role WHERE id = ?;`;
        connection.query(query, answer.id, (err, res)=>{
          if(err) throw err;
          console.log(`Role ${answer.id} deleted.`);
          main();
        });

      });
  });
}

function allDept(){
  connection.query(queryDepartment, (err, res)=>{
    if (err) throw err;
    const table =cTable.getTable(res);            
    console.log('\n'+table+'\n');
  });
  return main();
}

async function addDept(){
  const newDept = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the new department?'
    },
  ]); 

  const query = `INSERT INTO department (name) VALUES (?);`;
  connection.query(query, newDept.name,  (err, res)=>{
    if (err) throw err;
    console.log(`Department ${newDept.name} created`);
    main();
  });
}

function removeDept(){
  connection.query(queryDepartment, (err, res)=>{
    if(err) throw err;
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'id',
          message: 'Choose a department to delete.',
          choices(){
            const list = JSON.parse(JSON.stringify(res));
            return list;
          }  
        }
      ])
      .then(answer =>{
        const query = `DELETE FROM department WHERE id = ?;`;
        connection.query(query, answer.id, (err, res)=>{
          if(err) throw err;
          console.log(`Department ${answer[0]} deleted.`);
          main();
        });

      });
  });
}

function budgetByDept() {
  connection.query(queryDepartment, (err, res)=>{
    if(err) throw err;
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'id',
          message: "View the budget of which department?",
          choices(){
            const list = JSON.parse(JSON.stringify(res));
            return list;
          }  
        }
      ])
      .then(answer =>{
        const query = 
        `SELECT CONCAT(department.name) AS Department, SUM(role.salary) AS Budget
        FROM employee 
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        WHERE department_id = ?;`;

        connection.query(query, answer.id, (err, res)=>{
          if(err) throw err;
          const table =cTable.getTable(res);            
          console.log('\n'+table+'\n');
          main();
        });

      });
  });
}

async function main() {
  const answer = await inquirer.prompt({
    type : 'list',
    name: 'options',
    message: 'What would you like to do?',
    loop: false,
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
      budgetByDept();        
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