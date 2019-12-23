import React, { useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import { connect } from 'react-redux'

import { saveKey } from './actions';

import theme from './theme';
import mediaQueries from './media-queries';

import { Container } from './components/container';
import { Row } from './components/row';
import { FormInput } from './components/form-input';
import { Button } from './components/button';

import './save-key.scss';

const Col = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding-left: ${theme.gutter};
    padding-right: ${theme.gutter};
    text-align: center;
`;
Col.displayName = 'Col';

const OuterCol = styled(Col)`
    width: 100%;
    height: 100%;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    form {
        width: 100%;
        display: block;
        max-width: ${mediaQueries.min.iphone6};
    }
`;
OuterCol.displayName = 'OuterCol';

const SaveKey = (props) => {
    const [fieldValue, setFieldValue] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [fieldError, setFieldError] = useState(...props.fieldError);

    useEffect(() => {
        setFieldError(props.fieldError);

        if (fieldValue || fieldError) {
            setButtonDisabled(false)
        } else {
            setButtonDisabled(true)
        }
    }, [props.fieldError, fieldValue, fieldError]);

    const onSubmit = (event) => {
        event.preventDefault();
        console.log(fieldValue)
        if (fieldValue) {
            console.log("should dispatch")
            props.dispatch(saveKey(fieldValue))
        } else {
            setFieldError("Please enter an API Key")
        }
    }; 

    const onFieldChange = (event) => {
        setFieldValue(event.target.value);
    }; 

    return (
        <Container>
            <Row height="100%">
                <OuterCol>
                    <h1>Github Repo Issues</h1>
                    <p>Please submit your Github API Key to see issues for your repos</p>
                    <form
                        onSubmit={(event) => onSubmit(event)}
                    >
                        <fieldset>
                            <Row>
                                <Col>
                                    <FormInput
                                        value={fieldValue}
                                        fieldChange={event => onFieldChange(event)} 
                                        placeHolder="Github API Key"
                                        fieldError={fieldError}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button 
                                        type="submit"
                                        buttonText="Submit"
                                        disabled={buttonDisabled}
                                    />
                                </Col>
                            </Row>
                        </fieldset>
                    </form>
                </OuterCol>
            </Row>
        </Container>
    );
}

SaveKey.defaultProps = {
    fieldError: '',
};

export default connect()(SaveKey)