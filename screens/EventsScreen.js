import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, Pressable, Modal, Alert, Touchable, RefreshControl} from 'react-native';
import React, { Component, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer, StackActions, useNavigation } from '@react-navigation/native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MultiSelect } from "react-multi-select-component";
import { auth, db } from '../firebase';
import DateTimePicker from "@react-native-community/datetimepicker";

export function EventsScreen({route})
{   
    //console.log("EVENT SCREEN")
    const params = route.params;
    ////console.log(params);
    const [events, setEvents] = React.useState([]);
    const [status, setStatus] = React.useState('w');
    const [username, setUsername] = React.useState('123');
    const [role, setRole] = React.useState('abc');
    const [userid, setUserid] = React.useState("testjogundfig");
    const [searchText, changeText] = React.useState('');
    const [initEle, changeEle] = React.useState([]);
    const [showRSVP, setshowRSVP] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [rsvpModalVisible, setrsvpModalVisible] = React.useState(false);
    const [clickedEvent, setClickedEvent] = React.useState('');
    const [removed, setRemoved] = React.useState([]);
    const [toggle, setToggle] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const eventFormat = ["Event Name:", "Event Location:", "Event Time:", "Event Date:", "Event Description:", "Hosted By:","Current Capacity:", "Capacity:", "Status:"]
    const navigation = useNavigation();
    const [formattedDate, setFormattedDate] = React.useState('');
    const [formattedTime, setFormattedTime] = React.useState('');
    const [filterModalVisible, setFilterModalVisible] = React.useState(false)
    //filters
    const [dateFilter, setDateFilter] = React.useState(null);
    const [hostFilter, setHostFilter] = React.useState('');
    const [locationFilter, setLocationFilter] = React.useState('');
    const [filteredEvents, setFilteredEvents] = React.useState(params.eventList);
    //helpers
    const [date, setDate] = React.useState(new Date());
    const [enableDateFilter, setEnableDateFilter] = React.useState(false)
    const [enableDateFilterText, setEnableDateFilterText] = React.useState('Enable Date Filter')


    const [options, setOptions] = React.useState([
        {label: 'Attend', color:'green', value: 'w'},
        {label: 'Maybe', color: 'blue', value: 'm'},
        {label: "Won't attend", value: 'wa'},
        {label: 'Nemesis', value: 'nms'}
    ])
    const [open, setOpen] = React.useState(false)
    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(1000).then(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        fetchUserDetails();
        console.log("Use effect called")
    })
    
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

        return(month + "-" + dateNum + "-" + year);
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

    const fetchUserDetails = () => {
        db
          .collection('users')
          .doc(params.userEmail.toLowerCase())
          .get()
          .then(userCreds => {
            const userDetails = userCreds.data();
            setUsername(userDetails.name);
            setRole(userDetails.role);
            setUserid(userDetails.userid);
          })
          .catch(error => alert(error.message));
    }
 
    const handleSignOut = () => {
        auth
          .signOut()
          .then(() => {
            navigation.navigate('Login')
          })
          .catch(error => alert(error.message))
    }


    const navigateAccount = () => {
        navigation.navigate('Account', 
        {eventList: route.params.eventList, 
            userList: route.params.userList, 
            userid: userid, 
            userName: username, 
            userRole: role});
    }

    const eventPressHandler = (eventId) => {
        let eventIdx = route.params.eventList.findIndex(event => event.eventID == eventId)
        setClickedEvent(route.params.eventList[eventIdx])
    }

    
    const rsvpOptionsHandler = (eventID, btnSelection) => {
        let eventIdx = route.params.eventList.findIndex(event => event.eventID == eventID);
        let eventAttendees = route.params.eventList[eventIdx].attendees;


        Object.keys(eventAttendees).map(key => {
            let idx = eventAttendees[key].findIndex(user => user.userid == userid)
            if (idx >= 0) {
                eventAttendees[key].splice(idx, 1)
            }
        })


        if (route.params.eventList[eventIdx].inviteOnly) {
            if (route.params.eventList[eventIdx].invited.findIndex(invited => invited == userid) == -1) {
                alert("Event is invite-only and you are not in the invite list.")
            } else {
                eventAttendees[btnSelection].push({name: username, userid: userid})
            }
        } else {
            eventAttendees[btnSelection].push({name: username, userid: userid})     
        }

        var docID = 0;
        var query =  db.collection('events');
        query.where("eventID", "==", eventID).get().then(retrieved => {
            docID = retrieved.docs[0].id

            query.doc(docID).update({
                attendees: route.params.eventList[eventIdx].attendees
            })
        }).catch(err => alert(err.message));

    }

    function handleFilters() {

        console.log(params.eventList[4].date.toString().substring(0,10))
        let temp = [];
        console.log(dateFilter)
        for (let i = 0; i < params.eventList.length; i++) {
            const eventDate = params.eventList[i].date.toString().substring(0,10);
            const dateFilterTrue = dateFilter == null || eventDate == dateFilter;
            const hostFilterTrue = hostFilter == '' || params.eventList[i].host.hostname == hostFilter;
            const locFilterTrue = locationFilter == '' || params.eventList[i].location.name == locationFilter;
            if ( dateFilterTrue && hostFilterTrue && locFilterTrue) {
                temp.push(params.eventList[i]);
            }
        }
        setFilteredEvents(temp);
    }

    const clearFilters = event => {
        setDateFilter(null);
        setHostFilter('');
        setLocationFilter('');
    }

      

    const showAttendee = (eventID) => {
       

    }
    // const rsvpOptionsHandler = (rsvpStatus) => {
    //     let idx = EVENTDATA.findIndex(event => event.eventId === clickedEvent.eventId)
    //     console.log(EVENTDATA[idx].attendees)
    //     Object.keys(EVENTDATA[idx].attendees).forEach(element => {
    //         let userIdx = EVENTDATA[idx].attendees[element].findIndex(user => user === name)

    //         if (userIdx >= 0) {
    //             EVENTDATA[idx].attendees[element].splice(userIdx, 1)                
    //         }
            
    //     });

    //     if (rsvpStatus != "urs") {
    //         let found = EVENTDATA[idx].attendees[rsvpStatus].find(registered => registered === name)
            
    //         if (found !== undefined) {
                
    //         } else {
    //             if (rsvpStatus !== "urs") {
    //                 EVENTDATA[idx].attendees[rsvpStatus].push(name)
    //             }
    //         }
    //     }
        
    //     rsvpHandler()
    //     console.log(EVENTDATA[idx].attendees)

    // }

    // const removeAttendeeHandler = () => {
    //     setToggle(!toggle)
    //     for (let toRemov of removed){
    //         Object.keys(clickedEvent.attendees).forEach(element => {
    //             let userIdx = clickedEvent.attendees[element].findIndex(user => user === toRemov)

    //             if (userIdx >= 0) {
    //                 clickedEvent.attendees[element].splice(userIdx, 1)                
    //             }
    //         })
    //     }

    // }

    {
    return (
        <View style={theStyle.mainView}>
            <View style={filterArea.filterContainer}>
                <View style={screenDivide.leftSection}>
                    <View>
                        <View style={userArea.mainLoginContainer}>
                            <View>
                                <Text style={userArea.dispText}> Logged in as: {username} ({role}) </Text> 
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
                    </View>

                    <Modal visible={modalVisible}>
                        <View style={modalStyle.centeredView}>
                            <Text style={{fontSize: 22}}> Filter By Date </Text>
                            <Button title={enableDateFilterText} onPress={() => {
                                if (enableDateFilter) {
                                    setDateFilter(null)
                                    setEnableDateFilterText('Enable Date Filter')
                                } else {
                                    setEnableDateFilterText('Disable Date Filter')
                                }

                                setEnableDateFilter(!enableDateFilter)
                                
                                }}></Button>
                            <DateTimePicker
                                style={{width: 135, height: 40, backgroundColor: 'gray'}}
                                key="test1"
                                value={date}
                                onChange={(event, value) => {
                                    if (enableDateFilter) {
                                        setDateFilter(value.toString().substring(0, 10));
                                    }
                                }}
                            />

                            <Text style={{marginTop: 20}}>Host Filter</Text>
                            <TextInput placeholder='enter host name' style={modalStyle.textInput} 
                                onChangeText={user => setHostFilter(user)}>

                            </TextInput>
                            <Text style={{marginTop: 20}}>Location Filter</Text>
                            <TextInput placeholder='enter location' style={modalStyle.textInput} 
                                onChangeText={text => setLocationFilter(text)}>

                            </TextInput>
                            <TouchableOpacity style={[modalStyle.closeButton, {borderRadius: 10, marginTop: 20, width: 130, backgroundColor: 'yellow'}]} onPress={clearFilters}>
                                <Text style={{fontSize: 18}}>Clear Filters</Text>
                            </TouchableOpacity>
                            
                          
                            <TouchableOpacity style={[modalStyle.closeButton, {borderRadius: 10, marginTop: 10, width: 70, backgroundColor:'red'}]} onPress={() => {
                                setModalVisible(false)
                                handleFilters()}}>
                                <Text style={{fontSize: 18}}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <View style={filterArea.container}>
                        <View>
                            
                            <TouchableOpacity onPress={() => setModalVisible(true)}
                            style={filterArea.filterButton} >
                                <Text style={filterArea.btnText}> Filters </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                        style={[filterArea.filterButton, {backgroundColor: 'orange'}]}
                        onPress={() => {navigation.navigate('Map', {eventList:filteredEvents, userList:route.params.userList})}}
                        >

                            <Text style={filterArea.btnText}>Map</Text>
                        </TouchableOpacity>
                        <View>
                            <TouchableOpacity
                            style={[filterArea.filterButton, {backgroundColor: 'yellow'}]}
                            onPress={navigateAccount}>
                            <Text style={filterArea.btnText}> Account </Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={[eventsArea.container, {backgroundColor:'white'}]}>
                        <ScrollView refreshControl={
                            <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            />

                        }>

                        {filteredEvents.map(event => (
                            <View 
                            style={eventsArea.eventView}
                            key={event.id}>
                                <TouchableOpacity 
                                style={[eventsArea.eventBtn, eventsArea.btnOutline]}
                                onPress={() => eventPressHandler(event.eventID)}
                                >
                                    <Text style={{lineHeight: 17}}>
                                        Name: {event.name} {"\n"}
                                        Description: {event.desc} {"\n"}
                                        Date: {formatDate(event.date)} {"\n"}
                                        Time: {formatTime(event.time)} {"\n"}
                                        Capacity: {getAmountAttendees(event)} {"\\"} {event.cap} {"\n"}
                                        Location: {event.location.name}
                                    </Text>
                                </TouchableOpacity>

                                <View style={eventStatusArea.eventStatusContainer}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={eventStatusArea.eventBtnView}>
                                            <TouchableOpacity
                                            style={[eventStatusArea.rsvpBtn, {backgroundColor: 'green'}]}
                                            onPress={() => rsvpOptionsHandler(event.eventID, "W")}
                                            >
                                                <Text style={eventStatusArea.btnText}>
                                                    Attend
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                            style={[eventStatusArea.rsvpBtn, {backgroundColor: 'blue'}]}
                                            onPress={() => rsvpOptionsHandler(event.eventID, "M")}
                                            >
                                                <Text style={eventStatusArea.btnText}>
                                                    Maybe
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                            style={[eventStatusArea.rsvpBtn, {backgroundColor: 'red'}]}
                                            onPress={() => rsvpOptionsHandler(event.eventID, "WA")}
                                            >
                                                <Text style={[eventStatusArea.btnText, {paddingHorizontal: 5}]}>
                                                    Won't Attend
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                            style={[eventStatusArea.rsvpBtn, {backgroundColor: 'black'}]}
                                            onPress={() => rsvpOptionsHandler(event.eventID, "Nms")}
                                            >
                                                <Text style={[eventStatusArea.btnText]}>
                                                    Nemesis
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={eventStatusArea.attendeesContainer}>
                                            <View style={eventStatusArea.attndView}>
                                                <Text style={eventStatusArea.statusText}>
                                                    Attendees 
                                                </Text>

                                            <View style={{height: 160}}>
                                                <ScrollView 
                                                style={[eventStatusArea.attndDisp]}
                                                refreshControl={
                                                    <RefreshControl
                                                    refreshing={refreshing}
                                                    onRefresh={onRefresh}
                                                    />
                                                }>
                                                    {
                                                        event.attendees.W.map(entry => {
                                                            return (
                                                                <View
                                                                style={eventStatusArea.attndFormat}
                                                                key={entry.userid}>
                                                                    <Text> 
                                                                        {entry.name}
                                                                    </Text>
                                                                </View>
                                                            )
                                                        })
                                                    
                                                    }
                                                </ScrollView>
                                            </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        ))}

                    </ScrollView>
                    </View>
                </View>
            </View>
        </View>
        
    );
    
    }
}

const theStyle = StyleSheet.create({
    mainView:{
        flex:1,
        flexDirection: 'row',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignContent: 'center',

    },

    topView:{
        flex: 0.1,
        padding: 0,
        
        alignItems:"center",
        justifyContent:'center',
        backgroundColor:'black'
    },

    bottomView:{
        marginBottom: 40,
        alignItems:"center",
        justifyContent:'center'
    },

    menuBar:{
        borderWidth:1,
        flex:.1,
        flexDirection: 'row',
        alignItems:'baseline',
        justifyContent: 'space-between'
    },

    button:{
        flex:.4,
        backgroundColor: "#94B8FF",
        width: 40,
    },

    addBtn: {
        backgroundColor:'blue',
        justifyContent:'center',
        alignItems:'center',
        width:100,
        height:50,
        borderRadius:10
    },

    btnText: {
        color: 'white'
    },

    searchBar:{
        borderWidth:1,
        flex:1
    }
})

const viewArea = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        backgroundColor: '#ffffff',
        alignItems: 'center'
    },

    item: {
        flex: 1,
        marginTop: 10,
    },

    button: {
        flex: 1,
        marginTop: 10,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'pink',
    },
})

const screenDivide = StyleSheet.create({
    leftSection: {
        flex: 1,
    },

    rightSection: {
        flex: 1,
        backgroundColor: "#fffdcf",

    },
})

const filterArea = StyleSheet.create({
    container: {
        flex: 0.08,
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    filterContainer: {
        flex: 2,
    },

    filterButton: {
        marginTop: 3,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        width: 120,
        height: 35,
        borderRadius: 10
    },

    btnText: {
        color: 'black',
        fontWeight: 'bold',
    },
})

const eventsArea = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
    },

    eventBtn: {
        marginTop: 10,
        //marginRight: 42,
        paddingLeft: 4,
        width: 250,
        height: 180,
        borderRadius: 10,
        backgroundColor: '#cac2d4',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },

    btnOutline: {
        borderColor: '#CCD4C3',
        borderWidth: 5,
    },

    eventView: {
        //marginHorizontal: 30,
        flexDirection: 'row',
    },

})

const eventStatusArea = StyleSheet.create({
    eventStatusContainer: {
        marginRight: 10,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    eventBtnView: {
        height: 180,
        width: 60,
        backgroundColor: 'gray',
        marginTop: 10,
        //marginRight: 100,
        borderRadius: 10,
        alignItems: 'center',
    },

    rsvpBtn: {
        width: 55,
        height: 45,
        borderRadius: 10,
        marginVertical: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnText: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold',
    },

    attendeesContainer: {
        height: 180,
        width: 200,
        marginTop: 10,
        marginRight: 10,
        //alignContent: 'flex-start',
        backgroundColor: 'pink',

    },

    attndView: {
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: 'green',

    },

    attndDisp: {
        marginTop: 2,
        paddingLeft: 5,
        height: 160,
        width: 200
    },
    
    attndFormat: {
        marginVertical: 5,
    },

    statusText: {
        color: 'white',
        fontWeight: 'bold',
    },
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


    eventList: {

    },
})

const modalStyle= StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        
    },

    modalView: {
        flexDirection: 'column',
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        backgroundColor: 'rgba(100,100,100, 0.5)',
        padding: 50,
    },

    detailsView: {
        alignItems: "center",
        flex: 0.5,
        justifyContent: "center",
        backgroundColor: "white",
    },

    viewWrapper: {
        flex: 1,
        justifyContent: "space-around",
    },

    closeButton: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    closeButtonFull: {
        width: "50%",
    },

    closeButtonAThird: {
        width: "25%",
    },

    editButton: {
        backgroundColor: 'gray',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    removeButton: {
        backgroundColor: 'red',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    removeAttendeeButton: {
        backgroundColor: 'blue',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    removeButtonAThird: {
        width: "25%",
    },

    rsvpButton: {
        backgroundColor: 'green',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },

    rsvpOptions: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: '25%'
    },

    optionsView: {
        position: 'absolute',
        flex: 0.2,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        backgroundColor: 'rgba(100,100,100, 0.5)',
        padding: 200,
        paddingHorizontal: 300,

    },

    buttonRowAlign: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    
    textInput: {
        color:'black',
        width:200,
        height:30,
        backgroundColor:'white',
        borderWidth:3
    }
})


export default EventsScreen