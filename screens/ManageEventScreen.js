import React, { useState, useEffect } from "react";
import { RefreshControl, View, TouchableOpacity, Modal } from "react-native";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native";
import { auth, db } from '../firebase'
import { useNavigation } from "@react-navigation/native";
import MultiSelect from "react-native-multiple-select";



export function ManageEventScreen({route}) {
    console.log(route.params);
    const [formattedDate, setFormattedDate] = useState("");
    const [formattedTime, setFormattedTime] = useState("0");
    const [clickedEvent, setClickedEvent] = React.useState('');
    const [refreshing, setRefreshing] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] =  useState('');
    const [attendeeslist, setAttendeeslist] = useState([]);
    const [selected, setSelected] = useState([]);
    const navigation = useNavigation();
    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(1000).then(() => setRefreshing(false));
      }, []);
    
    const findEventThenSet = (eventID) => {
        let clicked = route.params.eventList.find(event => event.eventid === eventID)
        setClickedEvent(clicked);
    }
    const selectItemChange = (selectedItem) => {
        setSelected(selectedItem);
    }

    const navigateEdit = (eventID) => {
        console.log(route.params.eventList);
        console.log(eventID);
        findEventThenSet(eventID);
        navigation.navigate('Edit Event', 
        {selectedEventID: eventID, 
            eventList: route.params.eventList, 
            userName: route.params.userName,
            userRole: route.params.userRole, 
            userid: route.params.userid,
            userList: route.params.userList})
    }

    const openModal = (eventID) => {

        setModalData(eventID);
    }

    useEffect(() => {
        const initialValue = new Date();
        const dateNum = initialValue.getDate();
        const month = initialValue.getMonth() + 1;
        const year = initialValue.getFullYear();

        const hours = initialValue.getHours();
        const minutes = initialValue.getMinutes();

        setFormattedDate(month + "-" + dateNum + "-" + year);
        setFormattedTime(hours + "" + minutes);
    }, [])

    const handleSignOut = () => {
        auth
          .signOut()
          .then(() => {
            navigation.navigate('Login')
          })
          .catch(error => alert(error.message))
    }

    const findAttendees = (eventID) => {
        console.log(eventID)
        let eventIdx = route.params.eventList.findIndex(event => event.eventID == eventID);
        if (eventIdx >= 0){
            console.log(route.params.eventList[eventIdx].attendees.W)
            if (route.params.eventList[eventIdx].attendees.W.length != 0){
                setAttendeeslist(route.params.eventList[eventIdx].attendees.W)
            }
            else {
                alert("No attendees")
                setModalVisible(false)
            }
        }
    }

    const removeAttendeeHandler = (eventID) => {
        
        let eventIdx = route.params.eventList.findIndex(event => event.eventID == eventID);
        if (eventIdx >= 0){
                console.log((route.params.eventList[eventIdx]))
                for (let i = 0; i< selected.length;i++){
                    let attIdx = route.params.eventList[eventIdx].attendees.W.findIndex(att => att.userid == selected[0])
                    console.log(attIdx)
                    route.params.eventList[eventIdx].attendees.W.splice(attIdx, 1)
                }
            setSelected([])
        }
    }

    const deleteHandler = (eventID) => {
        console.log(eventID)
        let eventIdx = route.params.eventList.findIndex(event => event.eventID == eventID);
        if (eventIdx >= 0){
            console.log(eventIdx)
            route.params.eventList.splice(eventIdx, 1)
            console.log(route.params.eventList)
            removeFromDatabase(eventID)
        }
        else{
            console.log("Event not in array")
        }
    }
    
    const removeFromDatabase = (eventID) =>{
        db.collection('events').where('eventID', '==', eventID)
            .get()
            .then(retrieved => {
                docID = retrieved.docs[0].id
                db.collection('events').doc(docID).delete();
            }).catch((error) => {
                console.log("Error getting documents: ", error);
            });                    
    }

    return (
        <View
        style={{flex: 1}}>
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

            <View
            style={{justifyContent: 'center', alignItems: 'center', backgroundColor: 'gray', height: 30}}
            >
                <Text 
                style={{color: 'white', fontWeight:'bold'}}
                > Created Events</Text>
            </View>
            <ScrollView 
                refreshControl={
                    <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    />
                }
                >
                {route.params.eventList.map(event => {
                    if (event.host.hostid == route.params.userid){
                        return ( <View 
                        style={[eventsArea.eventView]}
                        key={event.eventID}>
                            <TouchableOpacity 
                            style={[eventsArea.eventBtn, eventsArea.btnOutline]}
                            onPress={() => {}}
                            >
                                <Text>
                                    Event Name: {event.name}
                                </Text>
                            </TouchableOpacity>

                            <View
                            style={{flexDirection: 'row'}}>
                                <TouchableOpacity
                                style={[btnArea.btn, {backgroundColor: '#00FF80'}]}
                                onPress={() => navigateEdit(event.eventID)}>
                                    <Text style={btnArea.btnText}> EDIT </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                style={[btnArea.btn, {backgroundColor: '#0800ff'}]}
                                onPress={() => {setModalVisible(true); findAttendees(event.eventID); openModal(event.eventID) } }>
                                    <Text style={btnArea.btnText}> ATTENDEES </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                style={[btnArea.btn, {backgroundColor: '#ff0800'}]}
                                onPress={() => deleteHandler(event.eventID)}>
                                    <Text style={btnArea.btnText}> DELETE </Text>
                                </TouchableOpacity>
                                
                            </View>
                            <Modal visible={modalVisible}>
                                <View
                                    style={{flex: 1, marginTop: 70, marginBottom: -70, width: "80%" , justifyContent:'center',}}>
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
                                        submitButtonText="Submit  "
                                        tagContainerStyle={{backgroundColor: 'cyan'}}
                                        tagTextColor="black"
                                        tagBorderColor="blue"
                                        fixedHeight={true}
                                        items={attendeeslist}
                                        onSelectedItemsChange={selectItemChange}
                                        selectedItems={selected}
                                        uniqueKey= "userid"
                                        />
                                    </View>
                                    <TouchableOpacity style={modalStyle.Btn} onPress={() => {
                                            setModalVisible(false)
                                            }}>
                                            <Text>Close</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={modalStyle.Btn} onPress={() => {
                                            setModalVisible(false); removeAttendeeHandler(modalData); console.log(modalData)
                                            }}>
                                                
                                            <Text>Remove Selected</Text>
                                    </TouchableOpacity>
                            </Modal>
                        </View>)
                    }
                    
                })}
                
            </ScrollView>
        </View>
    );
    
}

const eventsArea = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
    },

    eventBtn: {
        marginTop: 10,
        //marginRight: 42,
        paddingLeft: 4,
        width: "90%",
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
        justifyContent: 'center',
        alignItems: 'center',
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
})

const modalStyle= StyleSheet.create({
    centeredView: {
        justifyContent: "center",
        alignItems: "center",
    },

    modalView: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        padding: 50,
    },
    Btn: {
        width: 55,
        height: 45,
        borderRadius: 10,
        marginVertical: 0,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

const btnArea = StyleSheet.create({
    btn: {
        alignItems: 'center',
        width: "30%",
        height: "120%",
        borderRadius: 10,
        marginBottom: 10
    },

    btnText: {
        color: 'black',
        fontWeight: 'bold'
    },
})

const modalArea = StyleSheet.create({
    container: {
        flex: 1,
    },
})

export default ManageEventScreen;

