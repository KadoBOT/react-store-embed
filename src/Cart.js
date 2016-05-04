import Loader from './Loader';

var Cart = React.createClass({
    static: {
        minQuantity: 1,
        maxQuantity: 999
    },

    getInitialState: function() {
        return {
            loaded: false,
            error: false,
            redirecting: false,
            lineItems: [],
            checkoutPage: false,
            outOfSyncQuantity: {}
        };
    },

    componentDidMount: function() {
        this.serverRequest = window.StoreEmbeds.api.request('GET', 'cart', {}, this.onSuccess, this.onError);
    },

    componentWillUnmount: function() {
        if(this.serverRequest) {
            this.serverRequest.abort();
        }
    },

    onSuccess: function(response) {
        this.setState({
            loaded: true,
            lineItems: response.data.lineItems,
            outOfSyncQuantity: [],
            checkoutUrl: response.data.checkoutUrl
        });
    },

    onError: function(response){
        this.setState({
            loaded: true,
            error: response.error
        });
    },

    removeFromCart: function(item) {
        var data = {
            productId: item.productid,
        };

        if(item.variantid) {
            data.variantId = item.variantid;
        }

        this.serverRequest = window.StoreEmbeds.api.request('GET', 'cart/remove', data, this.onRemoveFromCartSuccess, this.onRemoveFromCartError);
    },

    onRemoveFromCartSuccess: function(response) {
        this.setState({
            lineItems: response.data.lineItems,
        });
    },

    onRemoveFromCartError: function(response) {
        alert(response.error);
    },

    getItemKey: function(item) {
        return item.productid + '-' + (item.variantid ? item.variantid + '-' : '');
    },

    isItemQuantityOutOfSync: function(item) {
        return typeof this.state.outOfSyncQuantity[this.getItemKey(item)] !== 'undefined' && this.state.outOfSyncQuantity[this.getItemKey(item)] !== item.quantity;
    },

    forceSyncQuantity: function() {
        this.setState({
            outOfSyncQuantity: {}
        });
    },

    validateQuantity: function(quantity) {
        quantity = parseInt(quantity) || 0;
        quantity = Math.max(quantity, this.static.minQuantity);
        quantity = Math.min(quantity, this.static.maxQuantity);
        return quantity+""; // hacky - but since quantity is stored in a string via api, it's better to compare this way
    },

    handleQuantityChange: function(item, event) {
        var key = this.getItemKey(item);
        var quantity = event.target.value === '' ? '' : this.validateQuantity(event.target.value);

        if(item.quantity === quantity) {
            if(typeof this.state.outOfSyncQuantity[key] !== 'undefined') {
                delete this.state.outOfSyncQuantity[key];
            }
        } else {
            this.state.outOfSyncQuantity[this.getItemKey(item)] = quantity;
        }

        this.setState({
            outOfSyncQuantity: this.state.outOfSyncQuantity
        });
    },

    incrementQuantity: function(item, event) {
        event.target.value = parseInt(this.refs[this.getItemKey(item) + '-q'].value) + 1;
        this.handleQuantityChange(item, event);
        this.handleQuantityUpdate(item, event);
    },

    decrementQuantity: function(item, event) {
        event.target.value = parseInt(this.refs[this.getItemKey(item) + '-q'].value) - 1;
        this.handleQuantityChange(item, event);
        this.handleQuantityUpdate(item, event);
    },

    handleQuantityUpdate: function(item, event) {
        if( ! this.isItemQuantityOutOfSync(item))
            return;

        var key = this.getItemKey(item);
        var outOfSyncQuantity = this.state.outOfSyncQuantity;
        var quantity = this.validateQuantity(outOfSyncQuantity[key]);

        // Make sure state is up to date, input can be blank and sometimes isn't validated
        outOfSyncQuantity[key] = quantity;

        this.setState({
            outOfSyncQuantity: outOfSyncQuantity
        });

        if(quantity === item.quantity)
            return;

        var data = {
            productId: item.productid,
            quantity: quantity
        };

        if(item.variantid) {
            data.variantId = item.variantid;
        }

        this.serverRequest = window.StoreEmbeds.api.request('GET', 'cart/quantity', data, this.onChangeQuantitySuccess, this.onChangeQuantityError);
    },

    onChangeQuantitySuccess: function(response) {
        this.setState({
            lineItems: response.data.lineItems
        });
    },

    onChangeQuantityError: function(response) {
        this.forceSyncQuantity();
        alert(response.error);
    },

    checkout: function() {
        if( ! this.state.checkoutUrl) {
            alert("Could not find the checkout url");
            return;
        }

        window.location.href = this.state.checkoutUrl;

        this.setState({
            redirecting: true
        });
    },

    render: function() {

        if( ! this.state.loaded) {
            return <Loader center/>;
        }

        if(this.state.error) {
            return <div>{ this.state.error }</div>;
        }

        // Calculate subtotal
        var subtotal = 0;
        var quantity = 0;

        var isEmpty = this.state.lineItems.length === 0;

        this.state.lineItems.map(function(item){
            subtotal += item.price * item.quantity;
            quantity += parseInt(item.quantity);
        });

        return (
            <div className="wsc-cart-page">
                <header className='wsc-cart-header clearfix'>
                    <h1>Cart ({quantity})</h1>
                    <button disabled={isEmpty || this.state.redirecting} onClick={this.checkout} className='wsc-btn wsc-btn-checkout'>Checkout</button>
                </header>
                <section className='wsc-cart-main'>
                    <header className='clearfix'>
                        <h3 className='wsc-col wsc-col-1'>Product</h3>
                        <h3 className='wsc-col wsc-col-2'>Item</h3>
                        <h3 className='wsc-col wsc-col-3'>Quantity</h3>
                        <h3 className='wsc-col wsc-col-4'>Totals</h3>
                    </header>
                    <ul className='wsc-cart-items clearfix'>
                        {
                            isEmpty ? (
                                <li className='wsc-cart-item empty'>
                                    <p>Your cart is empty. <a href={window.StoreEmbeds.api.getPage('catalog')}>Click here</a> to start shopping!</p>
                                </li>
                            )
                            :
                            (
                                this.state.lineItems.map(function(item, i){
                                    return (
                                        <li className='wsc-cart-item clearfix' key={this.getItemKey(item)}>
                                            <div className='wsc-col wsc-col-1'>
                                                <a href={window.StoreEmbeds.api.getPage('product', item.productid)}>
                                                    <div className='wsc-media'>
                                                        <img className='wsc-media-item fit' src={'https://www.webstartsshoppingcart.com/' + (item.thumbnail ? 'shopping-cart/graphics/' + item.thumbnail : 'images/noimage.jpg')} />
                                                    </div>
                                                </a>
                                            </div>
                                            <div className='wsc-col wsc-col-2'>
                                                <div className='wsc-product-details'>
                                                    <h3 className='wsc-product-title'>{item.product}</h3>
                                                    <ul className='wsc-product-options'>
                                                        {
                                                            (item.options || []).map(function(option, i){
                                                                return (
                                                                    <li key={this.getItemKey(item)+'-option-'+option.name}>{option.name}: {option.value}</li>
                                                                );
                                                            }, this)
                                                        }
                                                        <li>Price: ${item.price}</li>
                                                    </ul>
                                                </div>

                                                <a className='wsc-remove-item' onClick={this.removeFromCart.bind(this, item)}>Remove Item</a>
                                            </div>
                                            <div className='wsc-col wsc-col-3'>

                                                <div className='wsc-input-group wsc-quantity'>
                                                    <i className='pi pi-minus' onClick={this.decrementQuantity.bind(this, item)}></i>
                                                    <input type='text' ref={this.getItemKey(item)+'-q'} value={this.isItemQuantityOutOfSync(item) ? this.state.outOfSyncQuantity[this.getItemKey(item)] : item.quantity } onBlur={this.handleQuantityUpdate.bind(this, item)} onChange={this.handleQuantityChange.bind(this, item)} />
                                                    <i className='pi pi-plus' onClick={this.incrementQuantity.bind(this, item)}></i>
                                                </div>
                                            </div>
                                            <div className='wsc-col wsc-col-4'>
                                                <div className='wsc-item-total'>${(item.price * item.quantity).toFixed(2)}</div>
                                            </div>
                                        </li>
                                    );
                                }, this)
                            )
                        }
                    </ul>
                </section>
                <section className='wsc-cart-summary clearfix'>
                    <div className='wsc-cart-subtotal'>Subtotal: ${subtotal.toFixed(2)}</div>
                    <div className='wsc-cart-comments'>Tax and shipping will be calculated in checkout.</div>
                </section>
                <footer className='wsc-cart-footer clearfix'>
                    <div>
                        <button disabled={isEmpty || this.state.redirecting} onClick={this.checkout} className="wsc-btn wsc-btn-checkout">Checkout</button>
                    </div>
                </footer>
            </div>
        );

    },
});

export default Cart;
