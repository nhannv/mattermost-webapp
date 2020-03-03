// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {checkIfBranchExists, createBranch} from 'mattermost-redux/actions/branches';

import BranchUrl from './branch_url';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            checkIfBranchExists,
            createBranch,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(BranchUrl);
