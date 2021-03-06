import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';

import loading from '../../images/loading.gif';

import { Image } from '../image';

const LoadingContainer = styled.div`
	width: 100%;
	height: 100%;
	margin: auto;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const LoadingSpinner = (props) => (
    <LoadingContainer>
    	<Image src={loading} alt="Loading..." width={props.width} />
    </LoadingContainer>
);

LoadingSpinner.defaultProps = {
	width: "25px"
}

LoadingSpinner.propTypes = {
    /** A CSS color code. */
    color: PropTypes.string,
    /** Width spinner */
    width: PropTypes.string
};
