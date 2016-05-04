var MiniCart = React.createClass({

    getInitialState: function() {
        return {
            count: null,
            total: null
        };
    },

    componentDidMount: function() {
        // this.serverRequest = window.StoreEmbeds.api.request('GET', 'cart/count', {}, this.onSuccess, this.onError);
    },

    componentWillUnmount: function() {
        if(this.serverRequest) {
            this.serverRequest.abort();
        }
    },

    onSuccess: function(response) {
        this.setState({
            count: response.data.count,
            total: response.data.total
        });
    },

    onError: function(data){
        // error handling
        alert('ERROR! Check console...');
        console.log(data);
    },

    render: function() {
        return (
            <a className='wsc-cart' href={window.StoreEmbeds.api.getPage('cart')}>
                <i className='pi pi-basket'></i>
                {
                    (this.state.count !== null ? ' ' + this.state.count : '') +
                    (this.state.total !== null ? ' $' + this.state.total : '')
                }
            </a>
        );
    },
});

export default MiniCart;
