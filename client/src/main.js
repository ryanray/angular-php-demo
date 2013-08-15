var app = angular.module('app', [], function($routeProvider, $locationProvider){
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/login', {
      templateUrl: '/partials/login.html',
      controller: 'LoginCtrl'
    })
    .when('/user/:userId', {
      templateUrl: '/partials/user.html',
      controller: 'UserCtrl'
    })
    //TODO: could implement a 404 page
    .otherwise({redirectTo: '/'});
});

/**
 * AuthService provides a way to interact with Server Side Authentication.
 * BasicAuth was used instead of something session based to stay inline with REST principles.
 */
app.factory('AuthService', function($http, $location, AuthorizedUser, UserData, ConfigService){
  return {
    login: function(username, password, next, onError){
      //configure headers for BasicAuth
      $http.defaults.headers.common.Authorization = 'Basic ' + btoa(username + ':' + password);

      AuthorizedUser.loadByUsername(username, password, next, onError);

    },
    logout: function(){
      AuthorizedUser.clearAll();
      UserData.clearAll();
      $location.path(ConfigService.urls.login);
    }
  };
});

//May be better as a provider
app.factory('ConfigService', function(){
  return {
    urls: {
      login: '/login', 
      user: '/user'
    }
  };
});

/**
 * MainController is a basic wrapper to handle any Header or "Global" interactions.
 */
function MainCtrl($scope, $location, AuthorizedUser, AuthService, ConfigService){
  $scope.AuthorizedUser = AuthorizedUser;
  $scope.logout = AuthService.logout;
  $scope.redirectToLogin = function(){
    $location.path(ConfigService.urls.login);
  };
}


/**
 * LoginController to handle login form
 */
function LoginCtrl($scope, $location, AuthorizedUser, AuthService, ConfigService){

  $scope.handleLogin = function(){

    AuthService.login($scope.LoginModel.username, $scope.LoginModel.password, function(data){
      if(AuthorizedUser.isLoggedIn){
        //clear login form after login success
        $scope.LoginModel.username = '';
        $scope.LoginModel.password = '';
        $location.path(ConfigService.urls.user + '/' + AuthorizedUser.userId);
      }
      else {
        // show error message
        $scope.errorMessage = data.errorMessage;
      }
    }, function(){
      //on $http error show message
      $scope.errorMessage = 'There was a problem with your request';
    });
  };
}


/**
 * UserController is used to display the User Panel.
 */
function UserCtrl($scope, $http, AuthorizedUser, UserData, $location, ConfigService){
  $scope.UserData = UserData;

  // Redirect to login page if user is not authorized - this could probably be done better
  // in some sort of middleware.
  if(!AuthorizedUser.isLoggedIn || $location.path().indexOf(AuthorizedUser.userId) < 0){
    $location.path(ConfigService.urls.login);
    return false;
  }

  // Load the User's data to show in User Panel
  // Loading by AuthorizedUser's ID ensures that you can only see your own profile.
  UserData.loadById(AuthorizedUser.userId, function(data){
    if(data.errorMessage){
      $scope.errorMessage = data.errorMessage;
    }
  }, function(){
    // handle $http error
    $scope.errorMessage = 'Problem getting user data.';
  });

  // Save User form to db
  $scope.handleSaveUser = function(data){
    UserData.save(function(data){
      if(data.success){
        $scope.saveSuccessful = data.success;
        //clear existing error message if necessary
        $scope.errorMessage = null;
      }
      else if(data.errorMessage){
        $scope.errorMessage = data.errorMessage;
        $scope.saveSuccessful = null;
      }
    }, function(){
      // handle $http error
      $scope.errorMessage = 'There was a problem while trying to save your data.';
    });
  };
}

/**
 * AuthorizedUser represents the state of the current user and whether or not they
 * have been Authenticated.
 */
app.factory('AuthorizedUser', function($http, ConfigService){
  return {
    isLoggedIn: false,
    username: null,
    password: null,
    userId: null,
    update: function(data){
      this.isLoggedIn = data.isLoggedIn;
      this.username = data.username;
      this.userId = data.id;
    }, 
    clearAll: function(){
      this.isLoggedIn = false;
      this.username = null;
      this.userId = null;
    },
    loadByUsername: function(username, password, next, onError){
      var _this = this;
      $http.post(ConfigService.urls.login, {username: username, password: password})
        .success(function(data, status, headers, config){
          _this.update(data);
          next(data);
        }).error(function(){
          onError(); //TODO: pass on error details
        });
    }
  };
});

/**
 * UserData holds all the data necessary for the User Panel display. As of now this 
 * user is the same as AuthorizedUser but by keeping this object separate it will
 * make it easier to allow users to view the profile of someone else in the future.
 */
// Super ugly pattern - I look forward to learning a better/cleaner way to do this.
app.factory('UserData', function($http, ConfigService, AuthorizedUser){
  return {
    username: null,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    userId: null,
    update: function(data){
      this.username = data.username;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.email = data.email;
      this.phone = data.phone;
      this.userId = data.id;
    },
    clearAll: function(){
      this.username = null;
      this.firstName = null;
      this.lastName = null;
      this.email = null;
      this.phone = null;
      this.userId = null;
      this.password = null;
    }, 
    loadById: function(id, next, onError){
      var _this = this;
      $http.get(ConfigService.urls.user + '/' + id)
        .success(function(data, status, headers, config){
          _this.update(data);
          next(data);
        }).error(function(){
          onError(); //TODO: pass in error data
        });
    },
    save: function(next, onError){
      $http.put(ConfigService.urls.user + '/' + this.userId, this)
        .success(next).error(onError);
    }
  };
});