import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { Component } from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';



export class WelcomeScreen extends Component {
    render() {
        return (
            <View style = {theStyle.mainView}>

                    <Text style={theStyle.titleText}>
                        Campus Discovery Service
                    </Text>

                <View style = {theStyle.bottomContainer}>
                    <TouchableOpacity 
                    style={{justifyContent: 'center'}}
                    onPress={()=> this.props.navigation.navigate('Login')}
                    >
                        <View style={theStyle.startBtn}>
                            <Text style={theStyle.text}>Get Started</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
} 

const theStyle = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor:'white',
        justifyContent: 'center',
        alignItems: 'center',
    },

    topContainer: {
        flex: 3,

    },

    middleContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        
    },

    bottomContainer:{
        marginTop: 40,
        //backgroundColor:'red',
        justifyContent:'center',
        alignItems:'center'
    },

    startBtn: {
        backgroundColor:'blue',
        justifyContent:'center',
        alignItems:'center',
        width:150,
        height:50,
        borderRadius:20,
    },

    titleText: {
        fontSize: 60,
        fontWeight: "bold",
        textAlign: 'center',
    },

    text: {
        color: 'white',
        justifyContent:'center',
        alignItems:'center',
    },
})

export default WelcomeScreen

