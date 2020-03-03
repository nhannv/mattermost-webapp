// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';
import ReactDOM from 'react-dom';

import {bindActionCreators} from 'redux';

import {connect} from 'react-redux';

import {createBranch as createBranchFn} from 'mattermost-redux/actions/branches';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as URL from 'utils/url';

class CreateBranch extends React.PureComponent {
    static propTypes = {

        state: PropTypes.object,

        /*
         * Object containing information on the current branch, used to define BackButton's url
         */
        currentBranch: PropTypes.object,

        /*
         * Object containing information on the current selected channel, used to define BackButton's url
         */
        currentChannel: PropTypes.object,

        /*
         * String containing the custom branding's text
         */
        customDescriptionText: PropTypes.string,

        /*
         * String containing the custom branding's Site Name
         */
        siteName: PropTypes.string,

        /*
         * Object from react-router
         */
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to create a new branch
             */
            createBranch: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            nameError: '',
            isLoading: false,
            branch: {}
        };
    }

    updateParent = (state) => {
        this.setState(state);
        this.props.history.push('/create_branch/' + state.wizard);
    }

    submitNext = async (e) => {
        e.preventDefault();

        const name = ReactDOM.findDOMNode(this.refs.name).value.trim();
        const cleanedName = URL.cleanUpUrlable(name);
        const {actions: {createBranch}} = this.props;

        if (!name) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_branch.required'
                    defaultMessage='This field is required'
                />),
            });
            return;
        }

        if (cleanedName.length < Constants.MIN_TEAMNAME_LENGTH || cleanedName.length > Constants.MAX_TEAMNAME_LENGTH) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_branch.charLength'
                    defaultMessage='Name must be {min} or more characters up to a maximum of {max}'
                    values={{
                        min: Constants.MIN_TEAMNAME_LENGTH,
                        max: Constants.MAX_TEAMNAME_LENGTH,
                    }}
                />),
            });
            return;
        }

        this.setState({isLoading: true});
        var branchSignup = JSON.parse(JSON.stringify(this.state));
        branchSignup.branch.type = 'O';
        branchSignup.branch.name = name;

        const {data, error} = await createBranch(branchSignup.branch);

        if (data) {
            this.props.history.push('/' + data.name + '/channels/' + Constants.DEFAULT_CHANNEL);
            trackEvent('signup', 'signup_branch_03_complete');
        } else if (error) {
            this.setState({nameError: error.message});
            this.setState({isLoading: false});
        }
    }

    handleFocus = (e) => {
        e.preventDefault();
        e.currentTarget.select();
    }

    render() {
        const {
            currentChannel,
            currentBranch,
        } = this.props;

        let url = '/select_branch';
        if (currentBranch) {
            url = `/${currentBranch.name}`;
            if (currentChannel) {
                url += `/channels/${currentChannel.name}`;
            }
        }

        let nameError = null;
        let nameDivClass = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameDivClass += ' has-error';
        }

        let finishMessage = (
            <FormattedMessage
                id='create_branch.finish'
                defaultMessage='Finish'
            />
        );

        if (this.state.isLoading) {
            finishMessage = (
                <FormattedMessage
                    id='create_branch.creatingBranch'
                    defaultMessage='Creating branch...'
                />
            );
        }

        return (
            <div>
                <AnnouncementBar/>
                <BackButton url={url}/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <div className='signup__content'>
                            <div>
                                <form>
                                    <h5>
                                        <FormattedMessage
                                            id='create_branch.display_name.branchName'
                                            defaultMessage='Branch Name'
                                        />
                                    </h5>
                                    <div className={nameDivClass}>
                                        <div className='row'>
                                            <div className='col-sm-9'>
                                                <input
                                                    id='branchNameInput'
                                                    type='text'
                                                    ref='name'
                                                    className='form-control'
                                                    placeholder=''
                                                    maxLength='128'
                                                    defaultValue={this.state.branch.display_name}
                                                    autoFocus={true}
                                                    onFocus={this.handleFocus}
                                                    spellCheck='false'
                                                />
                                            </div>
                                        </div>
                                        {nameError}
                                    </div>
                                    <h5>
                                        <FormattedMessage
                                            id='create_branch.display_name.branchAddress'
                                            defaultMessage='Branch Address'
                                        />
                                    </h5>
                                    <div className={nameDivClass}>
                                        <div className='row'>
                                            <div className='col-sm-9'>
                                                <input
                                                    id='branchAddressInput'
                                                    type='text'
                                                    ref='name'
                                                    className='form-control'
                                                    placeholder=''
                                                    maxLength='256'
                                                    defaultValue={this.state.branch.address}
                                                    onFocus={this.handleFocus}
                                                    spellCheck='false'
                                                />
                                            </div>
                                        </div>
                                        {nameError}
                                    </div>
                                    <div className='mt-8'>
                                        <Button
                                            id='branchURLFinishButton'
                                            type='submit'
                                            bsStyle='primary'
                                            disabled={this.state.isLoading}
                                            onClick={this.submitNext}
                                        >
                                            {finishMessage}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            createBranch: createBranchFn,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(CreateBranch);