import React, { useState } from "react"
import "./EditProfilePopup.css"

function EditProfilePopup(props) {
    const [newEmail, setNewEmail] = useState("")
    const [newName, setNewName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const configuration = require("./config.json");

    const handlePasswordSubmit = (e) => {
        // Perform submit action here
        // You can access passwords.oldPassword and passwords.newPassword
        // to send the updated password data to the server or perform any other action
        let userId = parseInt(localStorage.getItem("userId"));
        let token = localStorage.getItem("token");
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            userId: userId,
            oldPassword: currentPassword,
            newPassword: newPassword,
        });

        var requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        fetch(
            configuration.endpoint + "/authentication/changePassword",
            requestOptions
        )
            .then((response) => response.text())
            .then((result) => {
                let resultJSON = JSON.parse(result);
                if (resultJSON.key !== "SUCCESS") {
                    alert(resultJSON.message);
                } else {
                    alert(resultJSON.message);
                    localStorage.clear();
                    window.location.href = "/";
                }
            })
            .catch((error) => console.log("error", error));
    };

    const handleSubmit = async (e) => {

        // Perform submit action here
        // You can access editedUser.email and editedUser.name
        // to send the updated data to the server or perform any other action
        let userId = parseInt(localStorage.getItem("userId"));
        let token = localStorage.getItem("token");
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            userId: userId,
            newEmail: newEmail,
            newName: newName,
        });

        var requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        fetch(configuration.endpoint + "/user/editProfile", requestOptions)
            .then((response) => response.text())
            .then((result) => {
                let resultJSON = JSON.parse(result);
                if (resultJSON.key !== "SUCCESS") {
                    alert("Ooops! Something went wrong.");
                }
                props.setTrigger(false);
                window.location.reload();
            })
            .catch((error) => console.log("error", error));
    };

    function insidePopup() {
        return (
            <div className="popup">
                <div className="popup-inner">
                    <br></br>
                    <center>
                        {props.popupType === "email" ?
                            <div>
                                <label>Email:</label>
                                <input
                                    type="text"
                                    name="email"
                                    onChange={(e) => { setNewEmail(e.target.value) }}
                                />
                                <br />
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={(e) => { setNewName(e.target.value) }}
                                />
                                <br />
                                <button type="submit" onClick={() => { handleSubmit() }}>Save</button>
                                <button type="button" onClick={() => { props.setTrigger(false) }} className="popup-close2" ><span aria-hidden="true">&times;</span></button>
                            </div> :
                            <div>

                                <label>Old Password:</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    onChange={(e) => { setCurrentPassword(e.target.value) }}
                                />
                                <br />
                                <label>New Password:</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    onChange={(e) => { setNewPassword(e.target.value) }}
                                />
                                <br />
                                <button type="submit"  onClick={() => { handlePasswordSubmit() }}>Save</button>
                                <button type="button" onClick={() => { props.setTrigger(false) }} className="popup-close2" ><span aria-hidden="true">&times;</span></button>
                            </div>}
                    </center>
                </div>
            </div>
        );
    }

    return (
        <div>
            {props.trigger === true ? insidePopup() : null}
        </div>
    );
}

export default EditProfilePopup;