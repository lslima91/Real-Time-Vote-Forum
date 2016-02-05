import React from 'react';//just for jsx

// Uses tcomb-form library for form validation
var LoginOptions = {
  fields: {

    login: {
      attrs: {
        autoFocus: true,
        placeholder: 'login...'
      },
      config: {
        size: 'xs'
      }
    },
    password: {
      type: 'password',
      attrs: {
        placeholder: 'password...',
      },
      config: {
        size: 'xs'
      }
    }
  }
};


var RegisterOptions = {
  fields: {
    login: {
      attrs: {
        autoFocus: true,
        placeholder: 'login...'
      }
    },
    email: {
      error: <i>Not a valid email</i>,
      attrs: {
        autoFocus: true,
        placeholder: 'mail@...'
      }
    },
    password: {
      type: 'password',
      attrs: {
        placeholder: 'password...',
        onBlur: function () {
          console.log('onBlur');
        }
      }
    }
  }
};



