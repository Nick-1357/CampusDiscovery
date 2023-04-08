import { StyleSheet,Iconbutton, Text, View, Button, TextInput, TouchableOpacity, Pressable, Modal, Alert} from 'react-native';
import React, { Component, useState } from 'react';
import { NavigationContainer, StackActions, useNavigation } from '@react-navigation/native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MultiSelect } from "react-multi-select-component"; 
import { MapViewNativeComponentType } from 'react-native-maps/lib/MapViewNativeComponent';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

export function AddLocationScreen({route}) {

    const [locationDigits, setLocationDigits] = useState('');
    const navigation = useNavigation();
    
    function addLocationHandler(location) {
        console.log(location.nativeEvent.coordinate);
        setLocationDigits(location.nativeEvent.coordinate);
        
    }

    const submitLocation = event => {
        navigation.navigate('Add Event', {name:route.params.name, role:route.params.role, navigation:route.params.navigation, locationDigits:locationDigits})
    }

    return (
        <View style={theStyle.mainView}>
            <MapView style={theStyle.mainView} region={{latitude: 33.7756, longitude: -84.3963, latitudeDelta: 0.01, longitudeDelta: 0.01}} showsUserLocation={true} 
                onPress={event => addLocationHandler(event)}  >
                {locationDigits != '' && <Marker style={theStyle.mainView} title={route.params.location} coordinate={locationDigits} />}
            </MapView>

            <View style={theStyle.button}>
                <Button title={'submit'} onPress={submitLocation}></Button>
            </View>
        </View>

    )
}



const theStyle = StyleSheet.create({
    mainView: {
        flex: 1,

    },
    titleInput:{
        flex: 1,
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'left',
    },
    locationInput:{
        flex: 1,
        borderWidth: 2
    },
    timeInput: {
        flex: 1,
        borderWidth: 2,
        alignItems: "left",
    },
    descriptionInput: {
        flex: 6,
        borderWidth: 2
    },
    button:{
        flex: .1,

    }
})

export default AddLocationScreen