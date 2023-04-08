import React, { useState, useRef, useEffect } from "react";
import { View, SafeAreaView, Switch, TouchableOpacity, LogBox } from "react-native";
import { StyleSheet } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Text } from "react-native";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from "@react-native-community/datetimepicker";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { db } from '../firebase'
import { useNavigation } from "@react-navigation/native";
import MultiSelect from "react-native-multiple-select";


export function AddEventScreen({route}) {
    console.log("ADD SECTION");

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState({name: "NA", lat: 33.77236, lng: -84.39484});
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState(1);
    const [selected, setSelected] = useState([]);
    const [attendees, updateAttendees] = React.useState( {"W": [], "M": [], "WA": [], "Nms": []});
    const [invite, setInvite] = React.useState(false);
    const [wait, setWait] = useState(false);
    const [userlist, setUserlist] = useState(route.params.userList);
    const [params, setParams] = useState(route.params);

    console.log(params);
    const navigation = useNavigation();
    const API_KEY = "AIzaSyCw7EKj2TVk95z3tg72zG4LwQ4nC_pGHeo";

    const capacityChange = (capacity) => {
        const numericRegex = /^([0-9]{1,10})+$/
        if(numericRegex.test(capacity)) {
            setCapacity(capacity)
        } else {
            setCapacity('')
        }
    }

    const toggleSwitch = () => {
        setInvite(!invite)
    }

    const selectItemChange = (selectedItem) => {
        setSelected(selectedItem);
    }

    const addHandler = () => {
        db.collection('events').add({
            name: title,
            desc: description,
            date: date,
            time: time,
            cap: capacity,
            eventID: params.eventID,
            inviteOnly: invite,
            location: {
                name: location.name,
                desc: location.desc,
                lat: location.lat,
                lng: location.lng
            },
            attendees: attendees,
            invited: selected,
            host: {
                hostname: params.userName,
                hostid: params.userid,
                role: params.userRole
            }
        }).catch(error => alert(error.message))

        params.eventList.push({
            name: title,
            desc: description,
            date: date,
            time: time,
            cap: capacity,
            eventID: params.eventID,
            inviteOnly: invite,
            location: {
                name: location.name,
                desc: location.desc,
                lat: location.lat,
                lng: location.lng
            },
            attendees: attendees,
            invited: selected,
            host: {
                hostname: params.userName,
                hostid: params.userid,
                role: params.userRole
            }
        });

        params.updateEventID(params.eventID + 1);
        // route.params.setState(route.params.updateState) 
        
        navigation.goBack();

    }

    const mapRef = useRef();
    useEffect(() => {
        mapRef.current.animateToRegion({latitude: location.lat, longitude: location.lng});
    }, [wait])


    return (
        <KeyboardAwareScrollView
        style={addDispl.container}
        keyboardShouldPersistTaps={'handled'}>
            <View 
            style={addDispl.mainWrapper}>

                <TextInput
                style={[addDispl.inputBox, {marginTop: 10}]}
                placeholder="Event Title"
                value={title}
                onChangeText={newText => setTitle(newText)}
                />

                <TextInput
                    placeholder="Event Description"
                    style={[addDispl.inputBox, {marginTop: 5, marginBottom: 14}]}
                    value={description}
                    onChangeText={newText => setDescription(newText)}
                />

                <View
                style={{width: "100%", 
                flexDirection: 'row', 
                justifyContent: 'flex-start', 
                marginBottom: 5}}
                >
                    <DateTimePicker
                    style={{width: 200, marginLeft: -40}}
                    key="test1"
                    value={date}
                    onChange={(event, value) => {
                        setDate(value);
                    }}
                    />

                    <DateTimePicker
                    style={{width: 100, height: 30}}
                    key="test2"
                    value={time}
                    mode={time}
                    onChange={(event, value) => {
                       setTime(value);
                    }}
                    />

                </View>

                <View
                style={{flexDirection:'row', alignItems: 'center', marginBottom: 5}}>
                    <TextInput
                        placeholder="Event Capacity"
                        style={[addDispl.inputBox, {width: 140}]}
                        value={capacity}
                        onChangeText={newText => {capacityChange(newText)}}
                    />

                    <View 
                    style={{marginLeft: 30}}>
                        <Text> Invite-only </Text>
                    </View>

                    <Switch
                    value={invite}
                    onValueChange={toggleSwitch}
                    />
                </View>


                <SafeAreaView style={[mapDisp.view, {zIndex: 1}]}>
                    <GooglePlacesAutocomplete
                    keyboardShouldPersistTaps={'handled'}
                    styles={{
                        container: {
                            width: "80%",
                            height: "100%",
                        },
                    }}
                    fetchDetails={true}
                    placeholder="Event Location"
                    query={{
                        key: API_KEY,
                    }}
                    onPress={(data, details) => {
                        console.log("pressed");
                        const coords = details?.geometry.location;
                        const locName = data?.structured_formatting.main_text
                        setLocation({name: locName, desc: data.description, lat: JSON.stringify(coords.lat), lng: JSON.stringify(coords.lng)});
                        setWait(!wait);
                    }}>

                    </GooglePlacesAutocomplete>

                </SafeAreaView>

                <MapView
                    ref={mapRef}
                    style={[mapDisp.container, {position: 'absolute'}]}    
                    minZoomLevel={15}                
                >
                    
                    <Marker
                    key={1}
                    coordinate={{latitude: location.lat, longitude: location.lng}}
                    title={location.name}
                    />

                </MapView>

                {
                invite &&
                <View
                style={{flex: 1, marginTop: 70, marginBottom: -70, width: "80%"}}>
                    <MultiSelect
                    styleMainWrapper={{marginTop: 30}}
                    styleListContainer={{height: 180}}
                    searchInputStyle={{height: 40, fontSize: 18}}
                    fontSize={15}
                    itemTextColor= 'black'
                    itemFontSize={18}
                    selectedItemTextColor="blue"
                    selectText= "Select Attendees"
                    submitButtonColor="black"
                    submitButtonText="Submit Selection(s)"
                    tagContainerStyle={{backgroundColor: 'cyan'}}
                    tagTextColor="black"
                    tagBorderColor="blue"
                    fixedHeight={true}
                    items={userlist}
                    onSelectedItemsChange={selectItemChange}
                    selectedItems={selected}
                    uniqueKey= "userid"
                    />
                </View>
                }

                <View
                style={{flex:1, marginTop: 100}}>
                    <TouchableOpacity
                    style={addDispl.submitBtn}
                    onPress={addHandler}>
                        <Text style={addDispl.btnText}> ADD EVENT </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>

    );
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
        justifyContent:"flex-end"

    },

    checkbox:{
        alignSelf: "auto",
        marginTop: 10,
        marginBottom: 10
    }
})

const addDispl = StyleSheet.create({
    container: {
        flex: 1,
    },

    mainWrapper: {
        flex: 1,
        alignItems: "center",
    },

    inputBox: {
        marginVertical: 8,
        paddingLeft: 10,
        backgroundColor: "white",
        width: "80%",
        height: 50,
    },


    submitBtn: {
        width: 120,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green'

    },

    btnText: {
        color: 'white',
        fontWeight: 'bold',
    },

})


const mapDisp = StyleSheet.create({
    container: {
        marginTop: 300,
        width: "80%",  
        height: 230,
    },

    view: {
        width: "100%",
        height: 200,
        alignItems:'center', 
    }
})
export default AddEventScreen;

