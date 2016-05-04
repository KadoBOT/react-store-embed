import Loader from './Loader';

var SimpleProduct = React.createClass({

    getInitialState: function() {
        return {
            loaded: false,
            error: false,
            product: null
        };
    },

    getDefaultProps: function() {
        return {
            product: null,
            productId: null,
            imageScale: 'crop',
            showPrice: true,
            showDivider: false,
            showName: true,
            showButton: false,
            buttonText: 'View More',
            action: 'goToProductPage', // goToProductPage || addToCart
        };
    },

    componentDidMount: function() {

        if(this.props.product) {
            this.setState({
                loaded: true,
                product: this.props.product
            });
            return;
        }

        if( ! this.props.productId) {
            this.setState({
                loaded: true,
                error: "Product no longer exists"
            });
        }

        this.serverRequest = window.StoreEmbeds.api.request('GET', 'product/' + this.props.productId, {}, this.onSuccess, this.onError);
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

    render: function() {

        if( ! this.state.loaded) {
            return <Loader center/>;
        }

        if(this.state.error) {
            return <div>{ this.state.error }</div>;
        }

        return (
            <a className='wsc-product' href={window.StoreEmbeds.api.getPage('product', this.state.product.productid)}>
                <div className="wsc-product-visual">
                    <div className="wsc-media">
                        <div className={"wsc-media-item " + this.props.imageScale} style={{backgroundImage: 'url(' + ('https://www.webstartsshoppingcart.com/' + (this.state.product.thumbnail ? 'shopping-cart/graphics/' + this.state.product.thumbnail : 'images/noimage.jpg')) + ')'}}></div>
                    </div>
                </div>
                <div className="wsc-product-content">
                    <div className='wsc-product-details'>
                        {this.props.showName ? <p className='wsc-product-title'>{this.state.product.product}</p> : ''}
                        {this.props.showDivider ? <hr /> : ''}
                        {this.props.showPrice ? <p className='wsc-product-price'>${this.state.product.price}</p> : ''}
                        {this.props.showButton ? <div className='wsc-btn'>{this.props.buttonText}</div> : ''}
                    </div>
                </div>
            </a>
        );
    }

});

export default SimpleProduct;
