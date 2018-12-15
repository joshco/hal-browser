HAL.Views.NonSafeRequestDialog = Backbone.View.extend({
  initialize: function(opts) {
    this.href = opts.href;
    this.vent = opts.vent;
    this.link_rel=opts.link_rel;

    this.uriTemplate = uritemplate(this.href);
    _.bindAll(this, 'submitQuery');
    this.on('box-ready', this.afterRender);

  },

  events: {
    'submit form': 'submitQuery'
  },

  className: 'modal fade',

  afterRender: function() {
    $('.modal').on('shown.bs.modal', function(e){
      console.log("bs modal loaded fired");

    });
    console.log('after render');
  },
  submitQuery: function(e) {
    e.preventDefault();

    var self = this,
        opts = {
          url: this.$('.url').val(),
          headers: HAL.parseHeaders(this.$('.headers').val()),
          method:  this.$('.method').val(),
          data: this.$('.body').val()
        };

    var request = HAL.client.request(opts);
    request.done(function(response) {
      self.vent.trigger('response', { resource: response, jqxhr: jqxhr });
    }).fail(function(response) {
      self.vent.trigger('fail-response', { jqxhr: jqxhr });
    }).always(function() {
      self.vent.trigger('response-headers', { jqxhr: jqxhr });
      window.location.hash = 'NON-GET:' + opts.url;
    });

    this.$el.modal('hide');
  },

  rel_map: function(rel) {
  },

  render: function(opts) {
    var headers = HAL.client.getHeaders(),
        headersString = '',
        view_self=this;

    _.each(headers, function(value, name) {
      headersString += name + ': ' + value + '\n';
    });

    this.$el.html(this.template({ href: this.href, user_defined_headers: headersString }));
    console.log("rel " + view_self.link_rel + "href " + view_self.href);
    this.$el.modal();
    this.$el.on('shown.bs.modal',function(e){
      console.log('inside render');
      var element = $(".osdi-body");
      var jseditor;
      JSONEditor.defaults.editors.object.options.remove_empty_properties = true;
      //document.getElementById('osdi-body');
      element.each(function(index, elem) {
        jseditor=new JSONEditor(elem,{
          // schema: {
          //   type: "object",
          //   properties: {
          //     given_name: {
          //       type: "string",
          //       options: {
          //         grid_columns: 6
          //       }
          //     },
          //     family_name: {
          //       type: "string",
          //       options: {
          //         grid_columns: 6
          //       }
          //     }
          //   }
          // },
          schema: {
            "$ref": "/api/v1/metadata/schema/" + osdi_schema_path(view_self.link_rel)
          },
          theme: 'bootstrap2',
          iconlib: "fontawesome4",
          disable_edit_json: true,
          disable_collapse: true,
          //disable_properties: true,
          //form_name_root: "",
          object_layout: 'grid',
          compact: true,
          ajax: true,
          display_required_only: true


        });
        //jseditor.setValue({});
        jseditor.on('change',function() {
          $('.osdi-json').val(JSON.stringify(jseditor.getValue()));
        });
      });
     //
    });
    console.log("nonget");
    this.trigger('box-ready');

    return this;
  },

  template: _.template($('#non-safe-request-template').html())
});
