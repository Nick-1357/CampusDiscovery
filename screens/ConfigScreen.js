import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import React, { Component, useEffect, useState } from 'react'; 
//import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from "../firebase"

export function ConfigScreen()
{
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [events, setEvents] = React.useState([]);
    const [userlist, setUserlist] = React.useState([]);
    const [fetched, setFetched] = React.useState(false); // Failsafe to prevent fetching database too many times

    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                navigation.navigate('Events', {eventList: events, userEmail: email, userList: userlist});
            }
        })

        return unsubscribe;

    })


    useEffect(() => {
        console.log("USE EFFECT CALLED")
        console.log(fetched);
        const events = []
        const tempUserlist = []

        if (!fetched) {
            db
            .collection('events')
            .get()
            .then((query) => {
                query.forEach((docs) => {
                    events.push(docs.data());
                });
                setEvents(events);
            })
            .catch(error => alert(error.message));

            db
            .collection('users')
            .get()
            .then(users => {
                users.forEach(userCreds => {

                    const userDetails = userCreds.data();
                    const name = userDetails.name;
                    const id = userDetails.userid;
                    
                    tempUserlist.push({name: name, userid: id});
                })

                setUserlist(tempUserlist);
            })
            .catch(error => alert(error.message));
            setFetched(true);
        }
    }, [])

    const loginStatusCheck = () => {
        const status = auth.currentUser?.email
        if (status != null) {
            auth.signOut();
        }
    }

    const handleLogin = () => {
        loginStatusCheck();
        auth
          .signInWithEmailAndPassword(email, password)
          .then(userCredentials => {
            const user = userCredentials.user;
            
          })
          .catch(error => alert(error.message))

    }


    const handleNavigationCheck = event =>{   
        if (nameValidate(email)) {
            handleLogin()
        }
    }

    const navigateRegister = () => {
        navigation.navigate('Registration', {setEm: setEmail})
    }

    const nameValidate = (name) => {
        let spaceCheckRegex = /[\s]/;
        if(name.length == 0 
            || name.trim() == null 
            || spaceCheckRegex.test(name).length == name.length) {
            return false
        }

        return true
    }

    return (
        <KeyboardAvoidingView
         style={theStyle.mainView}
         behavior={'padding'}>
            <View 
            //style = {theStyle.mainViewOutline}
            >
                <View style={theStyle.middleView}>
                    <View style ={theStyle.inputContainer}>
                        <TextInput 
                        style = {theStyle.input}
                        placeholder='Email'
                        value = {email}
                        onChangeText={newText => setEmail(newText)}
                        ></TextInput>
                        
                        <TextInput
                        style = {theStyle.input}
                        placeholder='Password'
                        value = {password}
                        onChangeText={newText => setPassword(newText)}
                        secureTextEntry
                        ></TextInput>
                    </View>
                </View>

                <View style={theStyle.buttonView}>
                    <TouchableOpacity 
                    onPress={handleNavigationCheck}
                    >
                        <View style={theStyle.button}>
                            <Text style={theStyle.btnText}> Login </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                    onPress= {navigateRegister}
                    >
                        <View style={theStyle.button}>
                            <Text style ={theStyle.btnText}> Register </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                
                
            </View>
        </KeyboardAvoidingView>
    );
}




const theStyle = StyleSheet.create({
    mainView: {
        flex: 1,
        justifyContent: 'center',   
        alignItems: 'center',     
    },

    mainViewOutline: {
        borderColor: 'yellow',
        borderWidth: 5,
    },

    middleView:{
        //backgroundColor:'red',
        justifyContent:'center',
        alignItems:'center'
    },

    buttonView: {
        //backgroundColor:'green',
        justifyContent:'center',
        alignItems:'center',
        flexDirection: 'row',
        marginTop: 15,
    },

    button: {
        backgroundColor:'blue',
        justifyContent:'center',
        alignItems:'center',
        width: 150,
        height: 50,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    
    btnText: {
        color: 'white',
        fontWeight: 'bold',
    },

    titleText: {
        marginTop: 40,
        fontSize: 50,
        fontWeight: "bold",
        flex: 3,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    inputContainer: {
        width: 320,
        
    },

    input: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 10,
    },

    inputTxtView: {
        width:'60%',
        height:30,
        borderWidth:1.5,
        borderColor:"black",
        borderRadius:5
        
    },  

    rolePicker: {
        width:'58%',
        borderColor:"black",
        borderWidth:1.5,
        borderRadius:10
    },




})

export default ConfigScreen