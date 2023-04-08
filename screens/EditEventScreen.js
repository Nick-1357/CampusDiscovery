import React, { useState, useRef, useEffect } from "react";
import { View, SafeAreaView, Switch, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { TextInput, ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from "@react-native-community/datetimepicker";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { auth, db } from '../firebase'
import { useNavigation } from "@react-navigation/native";
import MultiSelect from "react-native-multiple-select";

export function EditEventScreen({route}) {
    console.log("EDIT SCREEN")
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(new Date());
    const [formattedDate, setFormattedDate] = useState("");
    const [time, setTime] = useState(new Date());
    const [formattedTime, setFormattedTime] = useState("0");
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState(1);
    const [selected, setSelected] = useState('');
    const [attendees, updateAttendees] = React.useState( {"W": [], "M": [], "WA": [], "Nms": []});
    const [invite, setInvite] = React.useState(false);
    const [wait, setWait] = useState(false);
    const [userlist, setUserlist] = useState(route.params.userList);
    const [locDesc, setLocDesc] = useState();
    const navigation = useNavigation();
    

    const API_KEY = "AIzaSyCw7EKj2TVk95z3tg72zG4LwQ4nC_pGHeo";
    let docID = 0;

    useEffect(() => {
        const eventID = route.params.selectedEventID;
        var query =  db.collection('events');
        query = query.where("eventID", "==", eventID).get().then(retrieved => {
            docID = retrieved.docs[0].id
        }).catch(err => alert(err.message));

    })

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

    const handleSignOut = () => {
        auth
          .signOut()
          .then(() => {
            navigation.navigate('Login')
          })
          .catch(error => alert(error.message))
    }

    const editHandler = () => {
        //write once
        const eventIdx = route.params.eventList.findIndex(event => event.eventID == route.params.selectedEventID)

        db.collection('events').doc(docID).update({
            name: title,
            desc: description,
            date: route.params.eventList[eventIdx].date,
            time: route.params.eventList[eventIdx].time,
            cap: capacity,
            eventID: route.params.selectedEventID,
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
                hostname: route.params.userName,
                hostid: route.params.userid,
                role: route.params.userRole
            }
        }).catch(error => alert(error.message))
        
        route.params.eventList[eventIdx] = 
        {
            name: title,
            desc: description,
            date: route.params.eventList[eventIdx].time,
            time: route.params.eventList[eventIdx].time,
            cap: capacity,
            eventID: route.params.selectedEventID,
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
                hostname: route.params.userName,
                hostid: route.params.userid,
                role: route.params.userRole
            }
        }

        console.log(date);
        
        navigation.goBack();

    }
    const autoRef = useRef();
    const mapRef = useRef();

    const selectItemChange = (selectedItem) => {
        setSelected(selectedItem);
    }
    const formatDateTime = (eventFields) => {
        const convertedDate = new Date(eventFields.date.seconds * 1000)
        const dateNum = convertedDate.getDate();
        const month = convertedDate.getMonth() + 1;
        const year = convertedDate.getFullYear();

        setFormattedDate(month + "-" + dateNum + "-" + year);

        const convertedTime = new Date(eventFields.time.seconds * 1000);
        const hours = convertedTime.getHours();
        const minutes = convertedTime.getMinutes();
        
        setFormattedTime(hours + "" + minutes);

    }

    useEffect(() => {
        mapRef.current.animateToRegion({latitude: location.lat, longitude: location.lng});
    }, [wait])

    useEffect(() => {
        const eventID = route.params.selectedEventID;
        console.log(route.params.eventList)
        const eventFields = route.params.eventList.find(event => event.eventID === eventID)
        console.log(eventFields);
        setTitle(eventFields.name);
        setDescription(eventFields.desc);
        // setTime(new Date(eventFields.time.seconds * 1000));
        // setDate(new Date(eventFields.date.seconds * 1000));
        setCapacity(eventFields.cap);
        setInvite(eventFields.inviteOnly);
        setLocation(eventFields.location);
        setSelected(eventFields.invited);
        setUserlist(route.params.userList)
        setWait(!wait);
        autoRef.current.setAddressText(eventFields.location.desc);

    }, [])
 
        return (

        <View style={{flex: 1}}>
             <View style={userArea.mainLoginContainer}>
                <View>
                    <Text style={userArea.dispText}> Logged in as: {route.params.userName} ({route.params.userRole}) </Text> 
                </View>

                <View>
                    <TouchableOpacity
                    style={[userArea.signOutBtn, {borderColor: 'red', borderWidth: 2}]}
                    onPress={handleSignOut}
                    >
                        <Text style={userArea.btnText}> Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAwareScrollView
            style={[editDispl.container, {}]}
            keyboardShouldPersistTaps={'handled'}>
                <View
                style={[editDispl.mainWrapper, {}]}>

                    <TextInput 
                    style={[editDispl.inputBox, {marginTop: 10}]}
                    placeholder="Event Title"
                    value={title}
                    onChangeText={newText => {setTitle(newText),     console.log(selected);}}
                    />

                    <TextInput 
                    style={[editDispl.inputBox]}
                    placeholder="Event Description"
                    value={description}
                    onChangeText={newText => setDescription(newText)}
                    />

                {/* <View
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
                    setDate(value)                
                }}
                />

                <DateTimePicker
                style={{width: 100, height: 30}}
                key="test2"
                value={time}
                mode={time}
                onChange={(event, value) => {
                    setTime(value)
                }}
                />

                </View> */}

                <View
                style={{flexDirection:'row', alignItems: 'center', marginBottom: 5}}>
                    <TextInput
                        placeholder="Event Capacity"
                        style={[editDispl.inputBox, {width: 140}]}
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
                    ref={autoRef}
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
                    uniqueKey="userid"
                    />
                </View>
                }

                <View
                style={{flex:1, marginTop: 100}}>
                    <TouchableOpacity
                    style={editDispl.submitBtn}
                    onPress={editHandler}>
                        <Text style={editDispl.btnText}> SUBMIT CHANGES </Text>
                    </TouchableOpacity>
                </View>



                </View>
            </KeyboardAwareScrollView>

        </View>
    );
    
}


const editDispl = StyleSheet.create({
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
        width: 150,
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
        marginTop: 260,
        width: "80%",  
        height: 230,
    },

    view: {
        width: "100%",
        height: 200,
        alignItems:'center', 
    }
})

const userArea = StyleSheet.create({
    mainLoginContainer: {  
        flexDirection: 'row',
        justifyContent: "space-between",
        backgroundColor: "pink",
    },

    dispText: {
        color: 'black',
        fontWeight: 'bold',
    },

    selectorContainer: {
        height:30,
        flexDirection: 'row',
    },

    selector: {
        flex:1,
        width: "60%",
    },

    manageBtn: {
        width: 100,
        backgroundColor: 'white',
        alignItems: "center",
        justifyContent: 'center',
    },

    createBtn: {
        width: 100,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnOutline: {
        borderColor: 'blue',
        borderWidth: 2,
    },

    btnText: {
        fontSize: 13,
    },


    signOutBtn: {
        width: 100,
        height: 23,
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default EditEventScreen;

