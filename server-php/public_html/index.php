<?php
  require '../vendor/autoload.php';
  require '../lib/rb.php';
  require '../lib/auth.php';

  $app = new \Slim\Slim();
  $app->add(new \Slim\Middleware\ContentTypes());
  $app->add(new \HttpBasicAuth());

  // Initialize RedBeanPHP
  R::setup('mysql:host=127.0.0.1;dbname=bus_int_dev','db','password');

  /**
   * Common method to render the base layout
   */
  function renderLayout(){
    readfile('./layout.html');
  }

  /**
   * Common method for sending JSON response
   */
  function setJSONResponse($app, $arrayToBeJsonEncoded, $isLoggedIn){
    $res = $app->response();
    $res->header('Content-Type', 'application/json');
    $arrayToBeJsonEncoded['isLoggedIn'] = $isLoggedIn;
    $res->body(json_encode($arrayToBeJsonEncoded));
  }

  function createErrorResponseObj($message){
    return array('errorMessage' => $message);
  }

  /**
   * Return a complete UserData object.
   */
  function getUserDataById($userId){
    return R::getRow("SELECT id, firstName, lastName, username, email, phone FROM user WHERE id=:userId LIMIT 1;" 
      , array(':userId' => $userId));
  }

  /**
   * Returns an userId so Angular can redirect to the correct URL once logged in.
   */
  function getAuthorizedUserObjByUsername($username){
    $user = R::getRow("SELECT id FROM user WHERE username=:username LIMIT 1;"
      , array(':username' => $username));
    return array('id' => $user['id']);
  }

  /**
   * @param array - array of userData variables
   * @return number of rows affected
   */
  function saveUserData($userData){
    return R::exec("UPDATE user SET firstName=:firstName, lastName=:lastName, email=:email, phone=:phone WHERE id=:userId;"
      , $userData);
  }


  /**
   * Render default layout - one static file so a templating system would probably be overkill.
   */
  $app->get('/', function() {
    renderLayout();
  });


  /**
   * Authenticate user and return userId
   */
  $app->post('/login', function() use ($app) {
    $body = $app->request()->getBody();
    $username = $body['username'];

    setJSONResponse($app, getAuthorizedUserObjByUsername($username), true);
  });


  /**
   * Get all user data
   */
  $app->get('/user/:userId', function($userId) use ($app) {
    setJSONResponse($app, getUserDataById($userId), true);
  });


  /**
   * Save user data to database as long as all values are set.
   */
  $app->put('/user/:userId', function($userId) use ($app) {
    $body = $app->request()->getBody();

    //check for required fields
    if( !is_numeric($userId) || !isset($body['firstName']) || !isset($body['lastName']) || !isset($body['email']) 
      || !isset($body['phone']) ){
      setJSONResponse($app, createErrorResponseObj('There was a problem saving your information.'), true);
      return false;
    }

    saveUserData(array(':firstName' => $body['firstName'],':lastName' => $body['lastName'],':email' => $body['email']
      ,':phone' => $body['phone'],':userId' => $userId));

    //TODO: implement success based on # of rows affected returned from saveUserData
    setJSONResponse($app, array('success' => true), true);
  });

  $app->run();
?>
