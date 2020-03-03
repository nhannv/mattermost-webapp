// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentBranch} from 'mattermost-redux/selectors/entities/branches';

import CreateBranch from './create_branch';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentBranch = getCurrentBranch(state);

    const customDescriptionText = config.CustomDescriptionText;
    const siteName = config.SiteName;

    return {
        currentChannel,
        currentBranch,
        customDescriptionText,
        siteName,
    };
}

export default connect(mapStateToProps)(CreateBranch);
