var express = require('express');
var router = express.Router();

var mysql = require('mysql');
const config = require('../config');
console.log(config); 
var connection = mysql.createConnection(config);
connection.connect();

console.log("I connected!!!")

/* GET home page. */
router.get('/', function(req, res, next) {
  const selectQuery = 'SELECT * FROM tasks;';
  connection.query(selectQuery,(error,results)=>{
    res.render('index', {taskArray: results 
    });
  })
});

router.post('/addItem',(req, res, next)=>{
  const newTask = req.body.newTask;
  const newTaskDate = req.body.newTaskDate;
  // We know what the user submitted in the FormData. It comes to this route
  // inside req.body.NAMEOFFIELD. We store those values into a var.
  // Now we take those vars, and insert them into MySQL.

  // THIS IS BAD!!!!!!!!
  const badInsertQuery = `INSERT INTO tasks (taskName,taskDate)
             VALUES
          (${newTask},${newTaskDate});`;

	// var insertQuery = "INSERT INTO tasks (taskName, taskDate) VALUES ('"+newTask+"','"+dueDate+"')"
  // SQL injection.
  // is when a user inserts a SQL statement into a form
  // to run SQL when the dev didn't intend.
  const insertQuery = `INSERT into tasks(taskName,taskDate)
    VALUES
    (?,?);`;
  console.log(insertQuery);

  connection.query(insertQuery,[newTask,newTaskDate], (error, results)=>{
    if(error){
      // something bad happened. STOP
      throw error;
    }else{
      // Query succeeeded. Forward user to homepage
      res.redirect('/');
    }
  })

  // res.json(req.body)
})

// a wildcard route in Express 
// has a : in front of it
router.get('/delete/:id',(req,res,next)=>{
  // wildcard routes are available in req.params
  // res.json(req.params);
  const deleteQuery = `DELETE FROM tasks WHERE id = ?;`;
  connection.query(deleteQuery,[req.params.id],(error)=>{
    res.redirect('/');
  })

})

router.get('/edit/:id',(req, res)=>{
  // this route should be a pre-populated form
  // with the element with this id values
  const selectQuery = `SELECT * FROM tasks
    WHERE id = ?;`;
  connection.query(selectQuery,[req.params.id],(err,results)=>{
    results[0].taskDate  = formatDate(results[0].taskDate);
    res.render('edit',{
      task: results[0],
    });
  });
});

router.post('/editItem',(req, res)=>{
  // UPDATE the db
  const updateQuery = `UPDATE tasks SET 
    taskName = ?,
    taskDate = ?
    WHERE id = ?`
  connection.query(updateQuery,[req.body.newTask, req.body.newTaskDate, req.body.taskId],(error, results)=>{
    if(error){
      throw error;
    }else{
      res.redirect('/');
    }
  })
})

module.exports = router;


function formatDate(date) {
  let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}