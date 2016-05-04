var StoreApi = (function($){

    // Get query string parameter
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    // Update url with query string
    function updateQueryStringParameter(key, value, url) {
        if(!url) url = window.location.href;
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = url.indexOf('?') !== -1 ? "&" : "?";
        if (url.match(re)) {
            return url.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return url + separator + key + "=" + value;
        }
    }

    function StoreAPI(config) {
        this.config = config;
    }

    StoreAPI.prototype = {
        constructor: StoreAPI,

        goToPage: function(page, id) {
            window.location = this.getPage(page, id || null);
        },

        getPage: function(page, id) {
            var page = this.config.pages[page];

            if(id) {
                page = updateQueryStringParameter('id', id, page);
            }

            return page;
        },

        getParam: function(name, def) {
            var param = getParameterByName(name);

            if( ! param && typeof def !== 'undefined')
                param = def;

            return param;
        },

        getIdFromUrl: function(type) {
            // type = 'product'
            return getParameterByName('id');
        },

        getUrl: function(resource) {
            return 'http://connor.webstartsshoppingcart.com/api/v2/' + resource;
        },

        request: function(method, resource, data, success, error) {

            data.storeId = data.storeId || this.config.id;

            return $.ajax({
                method: method,
                url: this.getUrl(resource),
                data: data,
                xhrFields: {
                   withCredentials: true
                }
            }).always(function(response){
                if(response.error && typeof response.error !== 'string')
                    response.error = "Unexpected error";

                return response.error ? error(response) : success(response);
            });

        }

    };

    return StoreAPI;

}(jQuery));

export default StoreApi;
