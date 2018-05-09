import {MComponent} from "../../MComponent"
import {Checkbox} from "../../comp/Checkbox"
import React from "react"
import {Textarea} from "../../comp/Textarea"
import 'react-select/dist/react-select.css'
import BubblePreloader from 'react-bubble-preloader'
import {BACKEND_URL} from "../../const"
import axios from 'axios'
import Select from "react-select";

const LEVELS = []
for(let i = 0; i < 100; i++) {
    LEVELS.push({value: i, label: "Level " + i})
}

export class Levels extends MComponent {
    constructor(props) {
        super("LEVELS", props)
        this.state = {roles: null, roleOptions: null}
    }

    componentDidMount() {
        // noinspection JSUnresolvedVariable
        axios.get(BACKEND_URL + "/api/cache/guild/" + this.props.guild.id + "/roles").then(e => {
            const roles = e.data
            this.getLogger().debug("Got roles:", roles)
            this.setState({
                roles: roles,
                roleOptions: roles.sort((a, b) => a.name.localeCompare(b.name)).map(e => {
                    return {
                        // TODO: Colour
                        label: e.name,
                        value: e.id
                    }
                })
            })
        })
    }

    handleRoleSelect(e) {
        // TODO: Add a new role component down below
    }

    render() {
        if(this.state.roles) {
            return (
                <div className={"has-text-left"}>
                    <div className={"column is-12"}>
                        <div className={"toggle-row"}>
                            <div className={"is-inline-block"}>
                                <p className={"title is-size-5"}>Enable chat levels</p>
                                Allow users to gain xp and level up by chatting.
                            </div>
                            <span style={{marginLeft: "auto", marginRight: "1.5rem"}}/>
                            <Checkbox id={"welcome-toggle"} className="switch is-rounded is-primary is-medium"
                                      isChecked={true}/>
                        </div>
                    </div>
                    <div className={"column is-12"}>
                        <div className={"toggle-row"}>
                            <div className={"is-inline-block"}>
                                <p className={"title is-size-5"}>Enable level-up messages</p>
                                Have messages be sent in chat when someone levels up.
                            </div>
                            <span style={{marginLeft: "auto", marginRight: "1.5rem"}}/>
                            <Checkbox id={"welcome-toggle"} className="switch is-rounded is-primary is-medium"
                                      isChecked={true}/>
                        </div>
                    </div>
                    <div className={"column is-12"}>
                        <div className={"toggle-row"}>
                            <div className={"is-inline-block"}>
                                <p className={"title is-size-5"}>Enable level-up cards</p>
                                Allow some shiny images to be sent with the level-up messages.
                            </div>
                            <span style={{marginLeft: "auto", marginRight: "1.5rem"}}/>
                            <Checkbox id={"welcome-toggle"} className="switch is-rounded is-primary is-medium"
                                      isChecked={true}/>
                        </div>
                    </div>
                    <div className={"column is-12"}>
                        <div className={"toggle-col"}>
                            <div>
                                <p className={"title is-size-5"}>Level-up message</p>
                                The message sent when someone levels up.
                            </div>
                            <div className={"small-spacer-v"}/>
                            <Textarea className={"dark-textarea"} value={"{user.name} leveled :up: to {level}! :tada:"}
                                      rows={8} min-rows={8}/>
                        </div>
                    </div>
                    <div className={"column is-12"}>
                        <hr className={"dark-hr"}/>
                    </div>
                    <div className={"column is-12"}>
                        <div className={"toggle-row"}>
                            <div>
                                <p className={"title is-size-5"}>Role rewards</p>
                                Award roles to people when they reach certain levels.
                            </div>
                            <span style={{marginLeft: "auto", marginRight: "1.5rem"}}/>
                            <Select
                                className={"wide-select"}
                                name="channel-select"
                                value={null}
                                onChange={(e) => this.handleRoleSelect(e)}
                                options={this.state.roleOptions}
                                clearable={false}
                            />
                        </div>
                    </div>

                    <div className={"column is-12"}>
                        <div className={"toggle-row"}>
                            <div>
                                <p className={"title is-size-5"}>Meow</p>
                            </div>
                            <span style={{marginLeft: "auto", marginRight: "1.5rem"}}/>
                            <Select
                                className={"wide-select"}
                                name="channel-select"
                                value={LEVELS[1]}
                                onChange={(e) => this.handleRoleSelect(e)}
                                options={LEVELS}
                                clearable={false}
                            />
                        </div>
                        <div style={{position: "relative"}}>
                            <a className={"button is-danger toggle-corner-button"}><i className="far fa-trash-alt"/></a>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="has-text-centered" style={{width: "100vw"}}>
                    <BubblePreloader
                        colors={["white", "white", "white"]}
                    />
                </div>
            )
        }
    }
}
