var Loader = React.createClass({
    render: function() {
        var classes = '';
        var size = this.props.size || 100;

        if(this.props.center) {
            classes += ' center';
        }

        return (
            <div className={"wsc-loader" + classes} style={{width: size}}>
                <svg className="circular" viewBox="25 25 50 50">
                    <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" stroke-miterlimit="10"/>
                </svg>
            </div>
        );
    },
});

export default Loader;
