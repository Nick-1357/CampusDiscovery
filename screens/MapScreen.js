import { StyleSheet,Iconbutton, Text, View, Button, TextInput, TouchableOpacity, Pressable, Modal, Alert} from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MultiSelect } from "react-multi-select-component"; 
import { MapViewNativeComponentType } from 'react-native-maps/lib/MapViewNativeComponent';
import MapView from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps';
import {auth, db} from '../firebase';

export function MapScreen({route}) {
    
    const [events, setEvents] = React.useState(route.params.eventList);
    const [status, setStatus] = React.useState('w');
    const [username, setUsername] = React.useState('');
    const [role, setRole] = React.useState('');
    const [filteredEvents, setFilteredEvents] = useState([])
    
    function filterEvents(events, filters) {
        
    }

    function formatDate(tempDate) {
        let convertedDate = 0
        if (tempDate.seconds) {
            convertedDate = new Date(tempDate.seconds * 1000);
        } else {
            convertedDate = new Date(tempDate.getTime());
        }
        const dateNum = convertedDate.getDate();
        const month = convertedDate.getMonth() + 1;
        const year = convertedDate.getFullYear();

        return(month + "-" + dateNum + "-" + year);;
    }

    function formatTime(tempTime) {
        const convertedTime = new Date(tempTime * 1000);
        const hours = convertedTime.getHours();
        let minutes = convertedTime.getMinutes().toString();
        if (minutes.length == 1) {
            minutes = "0" + minutes;
        }

        return (hours + ":" + minutes);
    }

    function getAmountAttendees(event) {
        const attendees = event.attendees.W;
        return(attendees.length);
    }

        
    const mapMarkers = events.map((event) => <Marker
        key={event.eventID}
        coordinate={{latitude: event.location.lat, longitude: event.location.lng }}
        > 
         <Callout
         style={{height: 100}}>

            <Text style={{lineHeight: 17}}>
                Name: {event.name} {"\n"}
                Description: {event.desc} {"\n"}
                Date: {formatDate(event.date)} {"\n"}
                Time: {formatTime(event.time)} {"\n"}
                Capacity: {getAmountAttendees(event)} {"\\"} {event.cap} {"\n"}
                Location: {event.location.name}
            </Text>
                


         </Callout>

        
        </Marker>)

    return (
        
        <View style={theStyle.mainView}>
            <MapView style={theStyle.mainView} region={{latitude: 33.7756, longitude: -84.3963, latitudeDelta: 0.01, longitudeDelta: 0.01}} showsUserLocation={true}>
             {mapMarkers}
             
            </MapView>

           
        </View>
        
    );
}

const theStyle = StyleSheet.create({
    mainView: {
        flex: 1
    },
});
export default MapScreen