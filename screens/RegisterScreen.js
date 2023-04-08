import { Text, StyleSheet, View, TextInput, Pressable, TouchableOpacity} from "react-native";
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker'
import { auth, db } from "../firebase";
import { useNavigation } from "@react-navigation/native";


export function RegisterScreen({route}) 
{
    const [email, setEmail] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [role, setRole] = React.useState('Student');
    
    
    const navigation = useNavigation();
    const nameValidate = (name) => {
        let spaceCheckRegex = /[\s]/;
        if(name.length == 0 
            || name == null 
            || spaceCheckRegex.test(name).length == name.length) {
            return false
        }

        return true
    }

    const registerHandler = () => {
        if (nameValidate) {
            auth
            .createUserWithEmailAndPassword(email, password)
            .then(userCreds => {
                const user = userCreds.user
                storeInDatabase(user.email, user.uid)
            })
            .catch(error => alert(error.message))
        }

    }

    const storeInDatabase = (email, uid) => {
        const docRef = db.collection('users').doc(email)
        docRef.set({
            name: username,
            userid: uid,
            role: role,
            signedEvents: {w: [], m: [], wa: [], nms: []}
        })
        .catch(error => alert(error.message))

    }


    return (
        <View style={rgsr.mainView}>
            <View style={rgsr.inputContainer}>
                <TextInput
                style = {rgsr.input}
                placeholder='Email'
                value = {email}
                onChangeText = {newText => {setEmail(newText); route.params.setEm(newText)}}></TextInput>

                <TextInput
                style = {rgsr.input}
                placeholder='Username'
                value = {username}
                onChangeText = {newText => setUsername(newText)}></TextInput>

                <TextInput
                style = {rgsr.input}
                placeholder = 'Password'
                value = {password}
                onChangeText={newText => setPassword(newText)}
                secureTextEntry></TextInput>

            </View>

            <Text style={{marginTop:30, marginBottom: 10}}>Select Your Role</Text>
                <Picker
                style={[rgsr.roleView, {}]}
                selectedValue={role}
                onValueChange={newValue => setRole(newValue)}
                >
                    <Picker.Item label="Student" value = "Student" color='red'/>
                    <Picker.Item label="Teacher" value = "Teacher" color='blue'/>
                    <Picker.Item label="Organizer" value = "Organizer" color='green'/>
                </Picker>

            <View style={rgsr.buttonContainer}>
                <TouchableOpacity
                onPress = {registerHandler}
                >
                    <View style={[rgsr.button, {backgroundColor: "green"}]}>
                        <Text style={rgsr.buttonText}>
                            Register
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

}



const rgsr = StyleSheet.create({
    mainView:{
        flex: 1,
        alignItems: 'center',
    },

    inputContainer: {
        width: 300,
        marginTop: 50,
    },

    input: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 10,        
    },

    roleView: {
        width: 300,
        borderColor: 'black',
        borderWidth: 1.5,
        borderRadius: 10,
    }, 

    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    button: {
        width: 120,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },

})


export default RegisterScreen;
