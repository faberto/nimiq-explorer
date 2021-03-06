import React from "react";
import {compose} from 'recompose';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {actions as blockActions} from "ducks/blocks";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';


const ranges = ['day', 'week', 'month', 'year'];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

class GlobalHashRate extends React.Component {

    state = {
        range: 2,
    };

    componentWillMount() {
        this.fetchStatistics()
    }

    handleChange = (event, value) => {
        this.setState({ range: value }, () => {
            this.fetchStatistics()
        });
    };

    fetchStatistics = () => {
        this.props.blockActions.fetchStatistics('difficulty', ranges[this.state.range])
    }

    xAxisTickFormatter = (time) => {
        var date = new Date(time * 1000);
        return date.getDate() + ". " + months[date.getMonth()] + " " + date.toTimeString().slice(0, 5);
    }

    yAxisTickFormatter = (diff) => {
        return this._humanReadableHashesPerSecond(Math.round(diff * Math.pow(2, 16) / window.Nimiq.Policy.BLOCK_TIME));
    }

    _humanReadableHashesPerSecond(value) {
        var resultValue = 0;
        var resultUnit = "H/s";
        if(value < 1000) {
            resultValue = value;
        }
        else {
            var kilo = value / 1000;
            if(kilo < 1000) {
                resultValue = kilo;
                resultUnit = "kH/s";
            }
            else {
                var mega = kilo / 1000;
                if(mega < 1000) {
                    resultValue = mega;
                    resultUnit = "MH/s";
                }
                else {
                    resultValue = mega / 1000;
                    resultUnit = "GH/s";
                }
            }
        }
    
        return (resultValue).toFixed(0) + " " + resultUnit;
    }

    render() {
        const {blocks} = this.props;
        return (
            <div style={{maxWidth: 900, margin: '0 auto'}}>
                <Typography variant="title">Global Hashrate</Typography>
                <Typography variant="subheading">Estimated from mining difficulty</Typography>
                <Paper>
                    <Tabs
                        value={this.state.range}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={this.handleChange}
                        fullWidth
                    >
                        <Tab label="Day" />
                        <Tab label="Week" />
                        <Tab label="Month" />
                        <Tab label="Year" />
                    </Tabs>
                    <AreaChart width={900} height={250} data={blocks.statistics}
                               margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="timestamp" tickFormatter={this.xAxisTickFormatter} />
                        <YAxis dataKey="difficulty" tickFormatter={this.yAxisTickFormatter} />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip labelFormatter={this.xAxisTickFormatter} formatter={this.yAxisTickFormatter}/>
                        <Area type="monotone" dataKey="difficulty" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </Paper>
            </div>
        );
    }
}


GlobalHashRate.propTypes = {
    classes: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return {
        blocks: state.blocks
    };
}

function mapPropsToDispatch(dispatch) {
    return {
        blockActions: bindActionCreators(blockActions, dispatch)
    };
}

export default compose(
    connect(mapStateToProps, mapPropsToDispatch)
)(GlobalHashRate);
