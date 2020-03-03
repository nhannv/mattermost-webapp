// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Button, Tooltip} from 'react-bootstrap';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import Constants from 'utils/constants.jsx';
import * as URL from 'utils/url';
import logoImage from 'images/logo.png';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class BranchUrl extends React.PureComponent {
    static propTypes = {

        /*
         * Object containing branch's display_name and name
         */
        state: PropTypes.object,

        /*
         * Function that updates parent component with state props
         */
        updateParent: PropTypes.func,

        /*
         * Object with redux action creators
         */
        actions: PropTypes.shape({

            /*
             * Action creator to check if a branch already exists
             */
            checkIfBranchExists: PropTypes.func.isRequired,

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
        };
    }

    componentDidMount() {
        trackEvent('signup', 'signup_branch_02_url');
    }

    submitBack = (e) => {
        e.preventDefault();
        const newState = this.props.state;
        newState.wizard = 'display_name';
        this.props.updateParent(newState);
    }

    submitNext = async (e) => {
        e.preventDefault();

        const name = ReactDOM.findDOMNode(this.refs.name).value.trim();
        const cleanedName = URL.cleanUpUrlable(name);
        const urlRegex = /^[a-z]+([a-z\-0-9]+|(__)?)[a-z0-9]+$/g;
        const {actions: {checkIfBranchExists, createBranch}} = this.props;

        if (!name) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_branch.branch_url.required'
                    defaultMessage='This field is required'
                />),
            });
            return;
        }

        if (cleanedName.length < Constants.MIN_TEAMNAME_LENGTH || cleanedName.length > Constants.MAX_TEAMNAME_LENGTH) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_branch.branch_url.charLength'
                    defaultMessage='Name must be {min} or more characters up to a maximum of {max}'
                    values={{
                        min: Constants.MIN_TEAMNAME_LENGTH,
                        max: Constants.MAX_TEAMNAME_LENGTH,
                    }}
                />),
            });
            return;
        }

        if (cleanedName !== name || !urlRegex.test(name)) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_branch.branch_url.regex'
                    defaultMessage="Use only lower case letters, numbers and dashes. Must start with a letter and can't end in a dash."
                />),
            });
            return;
        }

        for (let index = 0; index < Constants.RESERVED_TEAM_NAMES.length; index++) {
            if (cleanedName.indexOf(Constants.RESERVED_TEAM_NAMES[index]) === 0) {
                this.setState({nameError: (
                    <FormattedMarkdownMessage
                        id='create_branch.branch_url.taken'
                        defaultMessage='This URL [starts with a reserved word](!https://docs.mattermost.com/help/getting-started/creating-branches.html#branch-url) or is unavailable. Please try another.'
                    />),
                });
                return;
            }
        }

        this.setState({isLoading: true});
        var branchSignup = JSON.parse(JSON.stringify(this.props.state));
        branchSignup.branch.type = 'O';
        branchSignup.branch.name = name;

        const {exists} = await checkIfBranchExists(name);

        if (exists) {
            this.setState({nameError: (
                <FormattedMessage
                    id='create_branch.branch_url.unavailable'
                    defaultMessage='This URL is taken or unavailable. Please try another.'
                />),
            });
            this.setState({isLoading: false});
            return;
        }

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
        let nameError = null;
        let nameDivClass = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameDivClass += ' has-error';
        }

        const title = `${URL.getSiteURL()}/`;
        const urlTooltip = (
            <Tooltip id='urlTooltip'>{title}</Tooltip>
        );

        let finishMessage = (
            <FormattedMessage
                id='create_branch.branch_url.finish'
                defaultMessage='Finish'
            />
        );

        if (this.state.isLoading) {
            finishMessage = (
                <FormattedMessage
                    id='create_branch.branch_url.creatingBranch'
                    defaultMessage='Creating branch...'
                />
            );
        }

        return (
            <div>
                <form>
                    <img
                        alt={'signup branch logo'}
                        className='signup-branch-logo'
                        src={logoImage}
                    />
                    <h3>
                        <FormattedMessage
                            id='create_branch.display_name.branchName'
                            defaultMessage='Branch Name'
                        />
                    </h3>
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
                                    defaultValue={this.props.state.branch.display_name}
                                    autoFocus={true}
                                    onFocus={this.handleFocus}
                                    spellCheck='false'
                                />
                            </div>
                        </div>
                        {nameError}
                    </div>
                    <h3>
                        <FormattedMessage
                            id='create_branch.display_name.branchAddress'
                            defaultMessage='Branch Address'
                        />
                    </h3>
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
                                    defaultValue={this.props.state.branch.address}
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
                    <div className='mt-8'>
                        <a
                            href='#'
                            onClick={this.submitBack}
                        >
                            <FormattedMessage
                                id='create_branch.branch_url.back'
                                defaultMessage='Back to previous step'
                            />
                        </a>
                    </div>
                </form>
            </div>
        );
    }
}
