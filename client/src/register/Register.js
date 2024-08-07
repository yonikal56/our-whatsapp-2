import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import FormBottom from '../form/FormBottom.js';
import FormItem from '../form/FormItem.js';
import "./Register.css"
import { fetchWithToken } from '../tokenManager/tokenManager.js';

function Register() {
    const password = useRef();
    const confirmPassword = useRef();
    const displayName = useRef();
    const username = useRef();
    const [profilePicture, setProfilePicture] = useState('photos/no_img.png');

    const regexes = {
        password: new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'),
        username: new RegExp('^[a-zA-Z0-9]{6,}$'),
        displayName: new RegExp('^[a-zA-Z0-9][a-zA-Z0-9 ]{4,}[a-zA-Z0-9]$')
    };

    const [errors, setErrors] = useState({
        username: "",
        password: "",
        displayName: "",
        confirm: "",
        usernameExists: "",
    });

    let navigate = useNavigate();

    function handleUsernameChange(e) {
        username.val = e.target.value;
    
        // clear the server error
        setErrors(prevState => ({
            ...prevState,
            serverError: ""
        }));
    }

    function validateValue(regex, value, field, error) {
        let flag = regex.test(value);
        if (!flag) {
            if(value === ""){
                setErrors(prevState => ({
                    ...prevState,
                    [field]: ""
                }));
            }else{
                setErrors(prevState => ({
                    ...prevState,
                    [field]: error
                }));
            }
        } else {
            setErrors(prevState => ({
                ...prevState,
                [field]: ""
            }));
        }
        return flag;
    }


    function checkField(e, regex, field, error) {
        if (e.target.value === "") {
            if (e.target.classList) {
                e.target.classList.remove('error');
            }
            setErrors(prevState => ({
                ...prevState,
                [field]: ""
            }));
        }else {
            if (!validateValue(regex, e.target.value, field, error)) {
                if (e.target.classList) {
                    e.target.classList.add('error');
                }
                if (field === "username") {
                    setErrors(prevState => ({
                        ...prevState,
                        usernameExists: ""
                    }));
                }
            } else {
                if (e.target.classList) {
                    e.target.classList.remove('error');
                }
            }
        }
    }

    async function tryRegister() {
        let flag1 = validateValue(regexes.username, username.val ? username.val : "", "username", "Username is invalid");
        let flag2 = validateValue(regexes.password, password.val ? password.val : "", "password", "Password is invalid");
        let flag3 = validateValue(regexes.displayName, displayName.val ? displayName.val : "", "displayName", "Display Name is invalid");
        let flag4 = validateValue(new RegExp('^' + password.val + '$'), confirmPassword.val ? confirmPassword.val : "", "confirm", "Confirm Password does not match password");
        if (flag1 && flag2 && flag3 && flag4) {
          let user = {
            username: username.val,
            password: password.val,
            displayName: displayName.val,
            profilePic: profilePicture,
          };
          try {
            const req = {
              path: 'Users',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(user),
            };
            const response = await fetchWithToken(req);
            if (response.status === 409) {
              setErrors(prevState => ({
                ...prevState,
                serverError: "Username already exists"
              }));
            } else {
              navigate('/login');
            }
          } catch (error) {
            
          }
        }
      }

    function handleFileInputChange(e) {
        const selectedFile = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            setProfilePicture(event.target.result);
        };

        reader.readAsDataURL(selectedFile);
    }

    return (
        <>
            <div className="col-lg-8 col-sm-10">
                <form className="form-register">
                    <div className="row">
                        <FormItem
                        type="text"
                        labelText="User Name:"
                        inputText="Enter your username"
                        tooltip="Username must be at least 6 chars, only letters and digits"
                        onChange={handleUsernameChange}
                        onKeyUp={(e) => checkField(e, regexes.username, "username", "Username is invalid")}
                        error={errors.username}
                        serverError={errors.serverError}
                    />
                        <FormItem
                            type="password"
                            labelText="Password:"
                            inputText="Enter your password"
                            tooltip="Password must be at least 8 chars and include uppercase and lowercase letters, digits and special character"
                            onChange={(e) => password.val = e.target.value}
                            onKeyUp={(e) => checkField(e, regexes.password, "password", "Password is invalid")}
                            error={errors.password}
                        />
                        <FormItem
                            type="text"
                            labelText="Display Name:"
                            inputText="Enter your display name"
                            tooltip="Display Name must be at least 6 chars, only letters, digits and spaces"
                            onChange={(e) => displayName.val = e.target.value}
                            error={errors.displayName}
                            onKeyUp={(e) => checkField(e, regexes.displayName, "displayName", "Display Name is invalid")}
                        />
                        <FormItem
                            type="password"
                            labelText="Confirm Password:"
                            inputText="Repeat your password"
                            tooltip="Confirm Password must be equal to password"
                            error={errors.confirm}
                            onChange={(e) => confirmPassword.val = e.target.value}
                            onKeyUp={(e) => checkField(e, new RegExp('^' + password.val + '$'), "confirm", "Confirm Password does not match password")}
                        />
                        {confirmPassword !== password && (
                            <div className="col-md-12 error-message"></div>
                        )}
                        <div className="col-md-6 mb-3">
                            <label className="form-label field">Profile Picture:</label>
                            <input
                                className="form-control"
                                type="file"
                                accept="image/*"
                                id="formFile"
                                onChange={handleFileInputChange}
                            ></input>
                        </div>
                        <div className="col-md-6">
                            <img id="selectedImage" src={profilePicture} alt="avatar"></img>
                            {!profilePicture && (
                                <img id="defaultImage" src="photos/no_img.png" alt="avatar"></img>
                            )}
                        </div>
                        <FormBottom
                            button="Register"
                            subComment="Already registered?"
                            sufComment=" to login"
                            onSubmit={(e) => { e.preventDefault(); tryRegister() }}
                            link="/login"
                        />
                    </div>
                </form>
            </div>
        </>
    );
}

export default Register;
