import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, TouchableOpacity, Text, RefreshControl} from 'react-native';
import { auth, db } from '../firebase'
import { ScrollView } from 'react-native-gesture-handler';

export function AccountScreen({route}) {
    console.log("ACCOUNT SECTION");
    const params = route.params
    const [username, setUsername] = React.useState(route.params.userName);
    const [role, setRole] = React.useState(route.params.userRole);
    const [eventID, setEventID] = React.useState('');
    const [userID, setUserID] = React.useState('');
    const [eventList, setEventlist] = React.useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [updateList, setUpdatelist] = React.useState(false);

    const navigation = useNavigation();

    const eventIdx = ['w', 'm', 'wa', 'nms'];

    useEffect(() => {
        let max = 0;
        route.params.eventList.map(event => {
            if (event.eventID > max) {
                max = event.eventID;
            }
        })

        setEventID(max + 1);
    }, [])
    
    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(1000).then(() => setRefreshing(false));
    }, []);

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


    const rsvpOptionsHandler = (eventID) => {
        let eventIdx = route.params.eventList.findIndex(event => event.eventID == eventID);
        let eventAttendees = route.params.eventList[eventIdx].attendees;

        console.log(eventID);
        console.log("BEFORE")
        console.log(eventAttendees);
        Object.keys(eventAttendees).map(key => {
            let idx = eventAttendees[key].findIndex(user => user.userid == route.params.userid)
            if (idx >= 0) {
                eventAttendees[key].splice(idx, 1)
            }
        })

        var docID = 0;
        var query =  db.collection('events');
        query.where("eventID", "==", eventID).get().then(retrieved => {
            docID = retrieved.docs[0].id

            query.doc(docID).update({
                attendees: route.params.eventList[eventIdx].attendees
            })
        }).catch(err => alert(err.message));
    }

    const handleSignOut = () => {
        auth
          .signOut()
          .then(() => {
            navigation.navigate('Login')
          })
          .catch(error => alert(error.message))
    }

    const navigateCreate = () => {
        navigation.navigate('Add Event', 
        {eventList: route.params.eventList,
            userList: route.params.userList,
            userid: route.params.userid, 
            userName: route.params.userName, 
            userRole: route.params.userRole,
            eventID: eventID,
            updateEventID: setEventID});
    }
    
    const navigateManage = () => {
        navigation.navigate('Manage Event', 
        {eventList: route.params.eventList,
            userList: route.params.userList,
            userid: route.params.userid, 
            userName: route.params.userName, 
            userRole: route.params.userRole,
            eventID: eventID,
            updateEventID: setEventID});
    }
    

    return(
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

            <View style={userArea.optionsContainer}>
                    <TouchableOpacity 
                        style={[userArea.createBtn, userArea.btnOutline]}
                        onPress={navigateCreate}
                    >
                            <Text style={[userArea.btnText]}> Create Events</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                    style={[userArea.manageBtn, userArea.btnOutline]}
                    onPress={navigateManage}
                    >
                        <Text style={[userArea.btnText]}> Manage Events </Text>
                    </TouchableOpacity>
            </View>

            <View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#bfbf00'}}>
                <Text style={userArea.dispText}> RSVPed Event </Text>
            </View>
            
            <View style={{justifyContent:'center'}}>
                <ScrollView
                style = {{height: "89%"}}
                refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    />
                }
                >
                    {route.params.eventList.map(event => {
                       return ( event.attendees.W.map(attendee => {
                             if(attendee.userid == route.params.userid) {

                                return (
                                    <View 
                                    style={eventsArea.eventView}
                                    key={event.id}>

                                        <TouchableOpacity 
                                        style={[eventsArea.eventBtn, eventsArea.btnOutline]}
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

                                        <View style={[eventStatusArea.eventStatusContainer]}>
                                                <View style={{width: 375, alignItems: 'center'}}>
                                                    <TouchableOpacity
                                                    style={[eventStatusArea.rsvpBtn, {backgroundColor: 'red'}]}
                                                    onPress={() => rsvpOptionsHandler(event.eventID)}
                                                    >
                                                        <Text style={eventStatusArea.btnText}>
                                                            Un-reserve
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                        </View>
                                    </View>
                                )
                            }
                        }))
                        
                    })
}
                                
                        
                </ScrollView>
            </View>
        </View>
    );
}


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

    optionsContainer: {
        height:30,
        flexDirection: 'row',
    },

    options: {
        flex:1,
        width: "60%",
    },

    manageBtn: {
        width: "50%",
        backgroundColor: 'white',
        alignItems: "center",
        justifyContent: 'center',
    },

    createBtn: {
        width: "50%",
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


const eventsArea = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
    },

    eventBtn: {
        marginTop: 10,
        //marginRight: 42,
        paddingLeft: 4,
        width: "80%",
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
        //flexDirection: 'row',
        alignItems: 'center'
    },

})

const eventStatusArea = StyleSheet.create({
    eventStatusContainer: {
       // marginRight: 10,
        // alignContent: 'center',
        // justifyContent: 'center',
    },

    eventBtnView: {
        height: 180,
        width: 4,
        backgroundColor: 'gray',
        //marginRight: 100,
        borderRadius: 10,
        alignItems: 'center',
    },

    rsvpBtn: {
        width: "80%",
        height: 40,
        borderRadius: 10,
        marginBottom: 15,
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

export default AccountScreen;