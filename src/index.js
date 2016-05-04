import StoreApi from './StoreApi';
import DetailedProduct from './DetailedProduct';
import SimpleProduct from './SimpleProduct';
import Cart from './Cart';
import MiniCart from './MiniCart';
import ProductCollection from './ProductCollection';

/* Hard coded for now */
var config = _wsConfig.store || {
        id: 219329,
        pages: {
          product: '/product.html',
          cart: '/cart.html',
          checkout: '/checkout.html',
          thankYou: '/thankYou.html',
        }
};

function getType($el) {
    return $el.data('widget-type');
}
function getProps($el) {
    var data = $el.data();
    var props = {};

    jQuery.each(data, function(key, val){
        if(key.indexOf('prop') === 0) {

            if(val === 'true') {
                val = true;
            } else if(val === 'false') {
                val = false;
            }

            var propName = key.replace('prop', '');
            propName = propName.charAt(0).toLowerCase() + propName.slice(1);

            if(val === 'dynamic') {
                props[propName] = window.StoreEmbeds.api.getIdFromUrl();
            } else {
                props[propName] = val;
            }

        }
    });

    return props;
}

window.StoreEmbeds = {
    api: new StoreApi(config),
    render: function($el) {
        ReactDOM.render(React.createElement(this.components[getType($el)], getProps($el)), $el[0]);
    },
    components: {}
};

window.StoreEmbeds.components.ProductCollection = ProductCollection;
window.StoreEmbeds.components.DetailedProduct = DetailedProduct;
window.StoreEmbeds.components.SimpleProduct = SimpleProduct;
window.StoreEmbeds.components.MiniCart = MiniCart;
window.StoreEmbeds.components.Cart = Cart;

(function($){
    $(document).ready(function(){
        $('.wsc-widget').each(function(){
            window.StoreEmbeds.render($(this));
        });
    });
}(jQuery));
