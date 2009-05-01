(function($) {
  $(function() {
    with(jqUnit) {
      context('Sammy.Application', 'init', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.random_setting = 1;
          });
        }
      })
      .should('create a sammy object', function() {
        defined(this.app, 'route');
      })
      .should('set arbitrary settings in the app', function() {
        equals(this.app.random_setting, 1);
      })
      .should('set namespace as random UUID', function() {
        matches(/^(\d+)-(\d{1,3})$/, this.app.namespace);
      })
      .should('initialize empty routes object', function() {
        isType(this.app.routes, Object);
      });


      context('Sammy.Application', 'route', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.route('get', /test/, function() {
              $('#main').trigger('click');
            });

            this.route('get', '/blah', function() {
              $('#testarea').show();
            });

            this.route('get', '/boosh/:boosh1/:boosh2', function() {
              $('#testarea').show();
            });

            this.get(/blurgh/, function() {
              alert('blurgh');
            });
          });
        }
      })
      .should('turn a string path into a regular expression', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][1];
        isType(route.path, RegExp);
      })
      .should('turn a string path with a named param into a regex and save to param_names', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][2];
        isType(route.path, RegExp);
        isObj(route.path, /\/boosh\/([^\/]+)\/([^\/]+)/);
        isObj(['boosh1', 'boosh2'], route.param_names);
      })
      .should('append route to application.routes object', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][0]
        isType(route.path, RegExp);
        equals(route.verb, 'get');
        defined(route, 'callback');
      })
      .should('allow shortcuts for defining routes', function() {
        var app = this.app;
        ok(app.routes['get']);
        var route = app.routes['get'][3];
        isType(route.path, RegExp);
        equals(route.verb, 'get');
        defined(route, 'callback');
      });
      //

      context('Sammy.Application','run', {
        before: function () {
          // $('.get_area').html('');
          this.app = new Sammy.Application(function() {
            this.route('get', '#/test', function() {
              this.log('running test')
              $('.get_area').text('test success');
              this.log('running test', $('.get_area').text());
            });
            
            this.route('post', /test/, function() {
              $('.get_area').text(this.params['test_input']);
              return false;
            });
          });
          this.app.run();
        }
      })
      .should('attach application instance to body', function() {
        isObj($('body').data('sammy.app'), this.app);
      })
      .should('live bind events to all forms', function() {
        var app = this.app;
        $('form').submit();
        soon(function() {
          this.equals($('.get_area').text(),'TEST');
          app.unload();
        });
      })
      .should('trigger events on URL change', function() {
        var app = this.app;
        window.location.hash = '#/test';
        soon(function() {
          this.equals($('.get_area').text(), 'test success');
          app.unload();
        });
      })
      .should_eventually('bind event to clicks as specified by routes')

      context('Sammy.Application','lookupRoute', {
        before: function() {
          this.app = new Sammy.Application(function() {
            this.route('get', /\/blah\/(.+)/, function() {
              $('#main').trigger('click');
            });

            this.route('post', '/blah', function() {
              $('#testarea').show();
            });
          });
        }
      })
      .should('find a route by verb and route', function() {
        var app = this.app;
        var route = app.lookupRoute('post','/blah');
        isType(route, Object)
        equals(route.verb, 'post');
        defined(route, 'callback');
      })
      .should('find a route by verb and partial route', function() {
        var app = this.app;
        var route = app.lookupRoute('get','/blah/mess');
        isType(route, Object)
        equals(route.verb, 'get');
        defined(route, 'callback');
      });
      
      context('Sammy.Application','runRoute', {
        before: function() {
          var context = this;
          this.app = new Sammy.Application(function() {
            this.route('get', /\/blah\/(.+)/, function() {
              context.params = this.params;
            });

            this.route('get', '#/boosh/:test/:test2', function() {
              context.params = this.params;
            });
          });
        }
      })
      .should('set named params from a string route', function() {
        this.app.runRoute('get', '#/boosh/blurgh/kapow');
        equals(this.params['test'], 'blurgh');
        equals(this.params['test2'], 'kapow');
      })
      .should('set unnamed params from a regex route in "splat"', function() {
        this.app.runRoute('get', '#/blah/could/be/anything');
        equals(this.params['splat'], 'could/be/anything');
      })
      .should('raise error when route can not be found', function() {
        var app = this.app;
        app.silence_404 = false;
        raised(/404/, function() {
          app.runRoute('get','/blurgh');
        });
      })
      .should('die silently if route is not found and 404s are off', function() {
        var app = this.app;
        app.silence_404 = true;
        notRaised(function() {
          app.runRoute('get','/blurgh');
        });
      })

    }
  });
})(jQuery);
