<?php
 
class HttpBasicAuth extends \Slim\Middleware
{
    /**
     * @var string
     */
    protected $realm;
 
    /**
     * Constructor
     *
     * @param   string  $realm      The HTTP Authentication realm
     */
    public function __construct($realm = 'Protected Area')
    {
        $this->realm = $realm;
    }
 
    /**
     * Deny Access
     *
     */   
    public function deny_access() {
        echo json_encode(array('isLoggedIn' => false, 'errorMessage' => 'Invalid username or password. '));     
    }
 
    /**
     * Authenticate
     *
     * @param   string  $username   The HTTP Authentication username
     * @param   string  $password   The HTTP Authentication password    
     *
     */
    public function authenticate($username, $password) {
        if(!ctype_alnum($username))
            return false;
         
        /**
         * NOTE: $password should be salted/hashed but I am skipping that so that its easier
         * for you to add test users to the database.
         */
        if(isset($username) && isset($password)) {

          $userData = R::getRow("select id, password from user where username=:username;"
            , array(':username' => $username));

          return (count($userData) > 0 && $password === $userData['password']);

        }
        else
            return false;
    }
 
    /**
     * Call
     *
     * This method will check the HTTP request headers for previous authentication. If
     * the request has already authenticated, the next middleware is called. Otherwise,
     * a 401 Authentication Required response is returned to the client.
     */
    public function call()
    {
        $req = $this->app->request();
        $res = $this->app->response();
        $authUser = $req->headers('PHP_AUTH_USER');
        $authPass = $req->headers('PHP_AUTH_PW');

        $acceptsJson = (strpos($req->headers('Accept'), 'json') > -1);
        $acceptsHtml = (strpos($req->headers('Accept'), 'html') > -1);

        if($acceptsHtml){
          // Render basic page for any html requests - this will allow angular to handle all the routes
          renderLayout();
        }
        else if (!$acceptsJson || $this->authenticate($authUser, $authPass)) {
          // The current design doesn't have any public JSON endpoints so we know that the user must be
          // Authenticated if they are asking for JSON - othewise let the request go through.
          $this->next->call();
        } else {
            $this->deny_access();
        }
    }
}