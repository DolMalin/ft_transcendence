import { Button, Flex, FormControl, FormErrorMessage, Input} from '@chakra-ui/react'
import * as Constants from '../game/globals/const'
import React, {useEffect, useState} from 'react'
import { useForm } from 'react-hook-form';
import authService from '../auth/auth.service';
import {Formik, Form, Field} from 'formik'


function UsernameChangeForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [formError, setFormError] = useState(undefined)

    function validateUsername(username : string) {
        
        if (typeof username != 'string')
            setFormError('input is not a string');
        if(username?.length < 3)
            setFormError('username is too short !');
        if(username?.length > 20)
            setFormError('username is too long !');
    }

    async function onChangeUsername(data : {newUsername : string}) {

        try {
            console.log(data);
            const res = await authService.patch(process.env.REACT_APP_SERVER_URL + '/users/', {username : data.newUsername})
        }
        catch(err) {
            console.error(`${err.response.data.message} (${err.response.data?.error})`)
        }
    }

    return (<>
        <Flex width="half" align="center" justifyContent="center" flexDir={'column'} paddingTop={'10px'}>
            <form onSubmit={handleSubmit(onChangeUsername)} style={{display: 'flex', flexDirection : 'column', justifyContent : 'center'}}>
                <FormControl isRequired>
                        <Input
                        type="text"
                        placeholder="your new battletag !"
                        textAlign={'center'}
                        marginBottom={'10px'}
                        {
                            ...register("newUsername", {
                                required: "enter new username",
                                minLength: 3,
                                maxLength: 20
                            })
                        }
                        />
                </FormControl>

                <Button
                fontWeight={'normal'}
                borderRadius={'0px'}
                textAlign={'center'}
                bg={Constants.BG_COLOR_FADED}
                textColor={'white'}
                _hover={{background : 'white', textColor : Constants.BG_COLOR}}
                type='submit'
                >
                    Submit
                </Button>
            </form>
        </Flex>
    </>)
}

function UsernameChange() {

    const [formVisible, setFormVisible] = useState(false)
    const text = formVisible ? "hmm maybe not" : "Change Username"

    return (<>
        <Button onClick={() => setFormVisible(formVisible ? false : true)}
        fontWeight={'normal'}
        borderRadius={'0px'}
        bg={Constants.BG_COLOR_FADED}
        textColor={'white'}
        _hover={{background : 'white', textColor : Constants.BG_COLOR}}
        > 
        {text} 
        </Button>
        {formVisible && <UsernameChangeForm/>}
    </>)
}

export default UsernameChange