USE employees_db;

INSERT INTO department (name)
VALUES ('Engineering');

INSERT INTO department (name)
VALUES('Sales');

INSERT INTO department (name)
VALUES('Finance');

INSERT INTO department (name)
VALUES('legal');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales lead', 100000, 2);

INSERT INTO role (title, salary, department_id)
VALUES ('Salesperson', 80000, 2);

INSERT INTO role (title, salary, department_id)
VALUES ('Lead Engineer', 15000, 1);

INSERT INTO role (title, salary, department_id)
VALUES ('Engineer', 120000, 1);

INSERT INTO role (title, salary, department_id)
VALUES ('Engineer', 130000, 1);

INSERT INTO role (title, salary, department_id)
VALUES ('Accountant', 125000, 3);

INSERT INTO role (title, salary, department_id)
VALUES ('Leagal team leader', 300000, 4);

INSERT INTO role (title, salary, department_id)
VALUES ('Lawyer', 250000, 4);

INSERT INTO role (title, salary, department_id)
VALUES ('Salesperson', 90000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Simon', 'Belmont', 1, NULL);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Sypha', 'Belnades', 2, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Trevo', 'Belmont', 3, NULL);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Grant', 'Danasty', 4, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Johnathan', 'Morris', 5, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Charlotte', 'Aulin', 6, NULL );

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Soma', 'Cruz', 7, NULL);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Mina', 'Hakuba', 8, 7);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Shanoa', 'Albus', 9, 1);


