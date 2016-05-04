import Loader from './Loader';

var Checkout = React.createClass({
    getInitialState: function() {
        return {
            loaded: true,

            sharedData: true,
            billingData: this.props.initialBillingData || {},
            shippingData: this.props.initialShippingData || {},

            paymentMethod: this.props.initialPaymentMethod || 'credit_card'
        };
    },

    handleBillingInputChange: function(event) {
        var billingData = this.state.billingData;

        billingData[event.target.name] = event.target.value;

        this.setState({
            billingData: billingData
        });
    },

    handleShippingInputChange: function(event) {
        var updatedState = {
            shippingData: this.state.shippingData
        };

        var key = event.target.name;
        var val = event.target.value;

        updatedState.shippingData[key] = val;

        if(this.state.sharedData) {
            updatedState.billingData = this.state.billingData;
            updatedState.billingData[key] = val;
        }

        this.setState(updatedState);
    },

    handleSharedCheckbox: function(event) {
        this.setState({
            sharedData: event.target.checked,
            billingData: event.target.checked ? this.state.shippingData : {}
        });
    },

    render: function() {

        if( ! this.state.loaded) {
            return <Loader center/>;
        }

        return (
            <div className="checkout-container">
                <div>
                    <div>Shipping</div>

                    <input type="text" name="name" ref="shippingName" onChange={this.handleShippingInputChange} placeholder="Full Name" value={this.state.shippingData.name} />
                    <input type="text" name="phone" ref="shippingPhone" onChange={this.handleShippingInputChange} placeholder="Phone" value={this.state.shippingData.phone} />
                    <input type="text" name="address" ref="shippingAddress" onChange={this.handleShippingInputChange} placeholder="Address" value={this.state.shippingData.address} />
                    <input type="text" name="city" ref="shippingCity" onChange={this.handleShippingInputChange} placeholder="City" value={this.state.shippingData.city} />
                    <input type="text" name="state" ref="shippingState" onChange={this.handleShippingInputChange} placeholder="State" value={this.state.shippingData.state} />
                    <input type="text" name="zip" ref="shippingZip" onChange={this.handleShippingInputChange} placeholder="Zip" value={this.state.shippingData.zip} />
                    <input type="text" name="country" ref="shippingCountry" onChange={this.handleShippingInputChange} placeholder="Country" value={this.state.shippingData.country} />
                </div>
                <label><input type="checkbox" checked={this.state.sharedData} onChange={this.handleSharedCheckbox} /> My billing address is the same as my shipping address</label>
                <div style={{display: this.state.sharedData ? 'none' : 'block'}}>
                    <div>Billing</div>

                    <input type="text" name="name" ref="billingName" onChange={this.handleBillingInputChange} disabled={this.state.sharedData} placeholder="Full Name" value={this.state.billingData.name} />
                    <input type="text" name="phone" ref="billingPhone" onChange={this.handleBillingInputChange} disabled={this.state.sharedData} placeholder="Phone" value={this.state.billingData.phone} />
                    <input type="text" name="address" ref="billingAddress" onChange={this.handleBillingInputChange} disabled={this.state.sharedData} placeholder="Address" value={this.state.billingData.address} />
                    <input type="text" name="city" ref="billingCity" onChange={this.handleBillingInputChange} disabled={this.state.sharedData} placeholder="City" value={this.state.billingData.city} />
                    <input type="text" name="state" ref="billingState" onChange={this.handleBillingInputChange} disabled={this.state.sharedData} placeholder="State" value={this.state.billingData.state} />
                    <input type="text" name="zip" ref="billingZip" onChange={this.handleBillingInputChange} disabled={this.state.sharedData} placeholder="Zip" value={this.state.billingData.zip} />
                    <input type="text" name="country" ref="billingCountry" onChange={this.handleBillingInputChange} disabled={this.state.sharedData} placeholder="Country" value={this.state.billingData.country} />
                </div>
                <div>
                    <textarea placeholder="Comments..."/>
                </div>
                <div>
                    <button>Submit</button>
                </div>
            </div>
        );

    },
});

export default Checkout;
