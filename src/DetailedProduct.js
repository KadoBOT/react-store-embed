import Loader from './Loader';

var DetailedProduct = React.createClass({

    getInitialState: function() {
        return {
            loaded: false,
            error: false,
            submitting: false,
            quantity: 1,

            product: null
        };
    },

    componentDidMount: function() {

        if(this.props.product) {

            this.setState({
                loaded: true,
                product: this.props.product
            });

        } else if(this.props.productId) {

            this.serverRequest = window.StoreEmbeds.api.request('GET', 'product/' + this.props.productId, {}, this.onSuccess, this.onError);

        } else {

            this.setState({
                loaded: true,
                error: "Product not found"
            });

        }

    },

    componentWillUnmount: function() {
        if(this.serverRequest) {
            this.serverRequest.abort();
        }
    },

    onSuccess: function(response){
        this.setState({
            loaded: true,
            product: response.data
        });
    },

    onError: function(response){
        this.setState({
            loaded: true,
            error: response.error
        });
    },

    onAddToCartSuccess: function(response) {
        window.StoreEmbeds.api.goToPage('cart');
    },

    onAddToCartError: function(response) {
        this.setState({
            submitting: false
        });

        alert(response.error);
    },

    addToCart: function() {
        this.setState({
            submitting: true
        });

        window.StoreEmbeds.api.request('GET', 'cart/add', {
            'productId': this.state.product.productid,
            'variantId': this.getVariantId(),
            'quantity': this.state.quantity
        }, this.onAddToCartSuccess, this.onAddToCartError);
    },

    getVariantId: function() {
        var variantId = null;

        // No product options, therefore no variant
        if(this.state.product.options.length === 0)
            return variantId;

        // Get the current selected options
        var selected = [];
        for (var i = 0; i < this.state.product.options.length; i++) {

            var option = this.state.product.options[i];

            selected.push({
                key: option.column_name,
                val: option.option_values.length === 0 ? "" : this.refs[option.column_name].value
            });

        }

        // Find the matching variant
        for (var i = 0; i < this.state.product.variations.length; i++) {
            var variant = this.state.product.variations[i];
            var matches = 0;

            for (var j = 0; j < selected.length; j++) {
                var opt = selected[j];
                if(variant[opt.key] === opt.val)
                    matches++;
            }

            if(matches === selected.length) {
                return variant.variantid;
            }
        }

        return variantId;
    },

    setQuantity: function(event) {
        this.setState({
            quantity: parseInt(event.currentTarget.value) || 1
        });
    },

    render: function() {

        if( ! this.state.loaded) {
            return <Loader center/>;
        }

        if(this.state.error) {
            return <div>{ this.state.error }</div>;
        }

        return (
            <section className='wsc-product-page'>
                <div className='columns'>
                    <div className='wsc-media'>
                        <img className='wsc-media-item fit' src={'https://www.webstartsshoppingcart.com/' + (this.state.product.thumbnail ? 'shopping-cart/graphics/' + this.state.product.thumbnail : 'images/noimage.jpg')} />
                    </div>
                </div>

                <div className='columns'>
                    <div className='wsc-product-details'>
                        <h1 className='wsc-product-title'>{this.state.product.product}</h1>
                        <div className='wsc-product-price'>${this.state.product.price}</div>
                        <form>
                            {this.state.product.options.map(function(option, i) {
                                return option.option_values.length > 0 ? (
                                    <div className='wsc-input-group' key={option.option_name}>
                                        <label className='wsc-label'>{option.option_name}
                                            <select className='wsc-form-control' ref={option.column_name} key={option.option_name}>
                                            {
                                                option.option_values.map(function(optionVal, j) {
                                                    return (<option value={optionVal} key={optionVal}>{optionVal}</option>)
                                                })
                                            }
                                            </select>
                                        </label>
                                    </div>
                                ) : ''
                            })}

                            <div className='wsc-input-group'>
                                <label className='wsc-label'>Quantity
                                    <select className='wsc-form-control' onChange={this.setQuantity} value={this.state.quantity}>
                                        {[1,2,3,4,5,6,7,8,9,10].map(function(q){
                                            return <option key={q} value={q}>{q}</option>
                                        })}
                                    </select>
                                </label>
                            </div>
                        </form>

                        <button className='wsc-btn' type='button' onClick={this.addToCart} disabled={this.state.submitting}><span>ADD TO CART</span></button>

                        <div className='wsc-product-description' dangerouslySetInnerHTML={{ __html: this.state.product.description }} />
                    </div>
                </div>
            </section>
        );
    }

});

export default DetailedProduct;
