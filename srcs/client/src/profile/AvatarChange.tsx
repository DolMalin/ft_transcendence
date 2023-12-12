import { Box, Button, Flex, FormControl, FormLabel, Input, Text} from '@chakra-ui/react'
import * as Constants from '../game/globals/const'
import React, {useRef, useState} from 'react'
import { useForm } from 'react-hook-form';
import authService from '../auth/auth.service';
import { wrap } from 'framer-motion';
import { LeftBracket, RightBracket } from '../game/game-creation/Brackets';

function AvatarChangeForm( props : {setFormVisible : Function}) {
	const { register, handleSubmit, formState: { errors } } = useForm();
    const [inputText, setInputText] = useState("choose an image");

    const onSubmit = async (data: {avatar : any}) => {
		try {
			const formData = new FormData()
			if (data.avatar)
            {
				formData.append("file", data.avatar[0]);
            }
			await authService.register(formData);
            props.setFormVisible(false);
		} catch(err) {
			console.log(err);
		}
	}

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event?.currentTarget?.value)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{display: 'flex', flexDirection : 'column', justifyContent : 'center',alignItems: 'center', flexWrap : 'wrap'}}>

            <FormControl isRequired>
                <Box display={'flex'} flexDir={'row'} alignItems={'center'} justifyContent={'center'}>
                    <LeftBracket w='12px' h='54px' girth='5px' marginRight='-5px'/>
                    
                        <Button
                        w={'220px'}
                        display={'flex'}
                        borderRadius={'0px'}
                        bg={'none'}
                        fontWeight={'normal'}
                        textColor={'white'}
                        padding={'2px'}
                        _hover={{textColor: 'black', bg:'white'}}
                        >
                            <label htmlFor="fileInput" 
                            style={{display: 'flex', alignItems: 'center', overflowX: 'auto', overflowY : 'hidden',textOverflow: 'ellipsis', whiteSpace: 'nowrap',scrollbarWidth:'thin'}}
                            >
                                {inputText}
                            </label>
                        </Button>
                    
                    <RightBracket w='12px' h='54px' girth='5px' marginLeft='-5px'/>
                </Box>
                <Input
                    required={false}
                    id='fileInput'
                    style={{ display: 'none' }}
                    type="file"
                    onInputCapture={handleChange}
                    {
                        ...register("avatar", {
                        })
                    }
                    accept="image/*"
                    />
            </FormControl>
            <Button
            fontWeight={'normal'}
            w={'150px'}
            borderRadius={'0px'}
            marginTop={'10px'}
            textAlign={'center'}
            bg={'none'}
            textColor={'white'}
            _hover={{background : 'white', textColor : Constants.BG_COLOR}}
            type='submit'
            >
                Submit
            </Button>
        </form>
    )
}

function AvatarChange() {
    const [formVisible, setFormVisible] = useState(false)
    const text = formVisible ? "maybe not" : "Change my Avatar"

    return (<>
        <Flex minH={'353px'}
        alignItems={'center'}
        justifyContent={'center'}
        flexDir={'column'}
        padding={'10px'}
        >
            <Button onClick={() => setFormVisible(formVisible ? false : true)}
            fontWeight={'normal'}
            borderRadius={'0px'}
            marginBottom={'10px'}
            bg={'none'}
            textColor={'white'}
            _hover={{background : 'white', textColor : Constants.BG_COLOR}}
            > 
            {text} 
            </Button>
            {formVisible && <AvatarChangeForm setFormVisible={setFormVisible}/>}
        </Flex>
    </>)
}

export default AvatarChange