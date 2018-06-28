const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const pg = require('pg');

// Initialise postgres client
const configs = {
  user: 'delontoh89',
  host: '127.0.0.1',
  database: 'pokemons',
  port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 * Routes
 * ===================================
 */


// GET all pokemon/ homepage

app.get('/', (request, response) => {
  // query database for all pokemon

  // respond with HTML page displaying all pokemon
  //
  const queryString = 'SELECT name FROM pokemon'

  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
    } 

    else {
      console.log('query result:', result);

      const context = {
        pokemon : result.rows
      };

      response.render('Home', context);

      // // redirect to home page
      // response.send( result.rows );
    }
  });
});


// GET pokemon data by ID

app.get('/pokemon/:id' , (request, response) => {


  const queryString = 'SELECT * FROM pokemon WHERE id = $1'

  const valueId = [parseInt(request.params.id)]

  pool.query(queryString, valueId, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
    } 

    else {
      console.log('query result:', result);

       const context = {
        pokemon : result.rows[0]
      };

      response.render('Pokemon', context);
    };
  });
});


// CREATE new pokemon

app.get('/new', (request, response) => {  // /pokemon/new gives error
  response.render('New');
});


app.post('/pokemon', (request, response) => {
  let params = request.body;

  const queryString = 'INSERT INTO pokemon(num, name, img, height, weight) VALUES($1, $2, $3, $4, $5) RETURNING *'
  const values = [params.num, params.name, params.img, params.height, params.weight];

  pool.query(queryString, values, (err, result) => {
    if (err) {
      console.log('query error:', err.stack);
    } else {
      console.log('query result:', result);

      // redirect to home page
      response.redirect('/');
    }
  });
});


// UPDATE pokemon data

app.get('/:id/edit', (request, response) => {

  let inputID = parseInt(request.params.id);

  const queryString = 'SELECT * FROM pokemon WHERE id = $1';

  const values = [inputID];

  pool.query(queryString, values, (err, result) => {
    if (err) {
      console.log('query error:', err.stack);
    } 
    else {
      console.log('query result:', result);

      let context = {
        pokemon : result.rows[0]
      };

      response.render('Edit', context);
    }
  });
});


app.put('/pokemon/edit/:id', (request, response) => {

  // let inputID = parseInt(request.params.id);

  let body = request.body;

  let queryString = 'UPDATE pokemon SET num = $1, name = $2, img = $3, height = $4, weight = $5 WHERE id = $6 RETURNING *'

  let values = [body.num, body.name, body.img, body.height, body.weight, request.params.id]

  pool.query(queryString, values, (err, result) => {
    if (err) {
      console.log('query error:', err.stack);
    } 
    else {
    //   console.log('query result:', result);
    
    //   let context = {
    //     pokemon : result.rows[0]
    //   }
    // }

    response.redirect('/pokemon/' + request.params.id)
    }
  });
})

app.delete('/pokemon/edit/:id' , (request, response) => {

  let queryString = 'DELETE FROM pokemon WHERE id =' + request.params.id

  pool.query(queryString, (err, result) => {
    if (err) {
      console.log('query error:', err.stack);
    } 
    else {
      response.redirect('/');
    }
  });
});




/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));
