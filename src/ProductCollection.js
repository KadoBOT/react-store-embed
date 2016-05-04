import Loader from './Loader';
import SimpleProduct from './SimpleProduct';

var ProductCollection = React.createClass({

    getInitialState: function() {
        var initialPage = _ws && _ws.inEditor ? '1' : window.StoreEmbeds.api.getParam('page', '1');

        return {
            // widget state
            loaded: false,
            error: false,

            // pagination
            page: initialPage,
            next_page: null,
            prev_page: null,

            // data
            products: []
        };
    },

    componentDidMount: function() {
        this.loadPage(this.state.page);

        History.Adapter.bind(window,'statechange', this.onPopState);
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();

        // Should probably unbind history popstate event here
    },

    loadPage: function(page) {
        if(this.serverRequest) {
            this.serverRequest.abort();
        }

        this.setState({
            loaded: false,
            error: false,
            products: []
        });

        this.serverRequest = window.StoreEmbeds.api.request('GET', 'products', {page: page}, this.onSuccess, this.onError);
    },

    onPopState: function(event) {
        var State = History.getState(); // Note: We are using History.getState() instead of event.state

        this.loadPage(State.data.page);
    },

    onSuccess: function(response) {
        this.setState({
            loaded: true,
            error: false,
            page: response.current_page,
            next_page: response.current_page === response.last_page ? null : response.current_page + 1,
            prev_page: response.current_page === 1 ? null : response.current_page - 1,
            products: response.data
        });
    },

    onError: function(response) {
        this.setState({
            loaded: true,
            error: response.error
        });
    },

    previousPage: function() {
        if( ! this.state.prev_page) return;

        History.pushState({page: this.state.prev_page}, '', '?page=' + this.state.prev_page);
    },

    nextPage: function() {
        if( ! this.state.next_page) return;

        History.pushState({page: this.state.next_page}, '', '?page=' + this.state.next_page);
    },

    render: function() {

        if( ! this.state.loaded) {
            return <Loader center/>;
        }

        if(this.state.error) {
            return <div>{ this.state.error }</div>;
        }

        return (
            <section className='wsc-product-collection'>
                <ul className='clearfix'>
                    {this.state.products.map(function(product, i) {
                            return (
                                <li key={product.productid}>
                                    <SimpleProduct product={product} />
                                </li>
                            )
                    }.bind(this))}
                </ul>
                <div className='clearfix'>
                    <button className='wsc-btn wsc-btn-prev' disabled={!this.state.prev_page} onClick={this.previousPage}>Previous</button>
                    <button className='wsc-btn wsc-btn-next' disabled={!this.state.next_page} onClick={this.nextPage}>Next</button>
                </div>
            </section>
        );

    }

});

export default ProductCollection;
