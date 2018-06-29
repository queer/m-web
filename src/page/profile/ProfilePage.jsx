import {MComponent} from "../../MComponent"
import React from "react"
import {connect} from 'react-redux'
import {VHContainer} from "../VHContainer"
import BubblePreloader from 'react-bubble-preloader'
import Modal from 'react-modal'
import {DebouncedTextarea} from "../../comp/DebouncedTextarea"
import axios from 'axios'
import {BACKEND_URL} from "../../const"
import ProgressiveImage from 'react-progressive-bg-image'
import {NotFound} from '../NotFound'

class BackgroundCard extends MComponent {
    constructor(props) {
        super("BACKGROUNDCARD", props)
    }

    render() {
        return (
            <div className="profile-background-image-wrapper rounded-corners hover"
                onMouseOver={() => this.props.backgroundMouseOver(this.props.src.replace(".png", ""))}
                onMouseOut={() => this.props.backgroundMouseOut()}>
                <a onClick={() => this.props.backgroundOnClick(this.props.name, this.props.pack, this.props.src)}>
                    {/* TODO: On-click animation registering use */}
                    <div className="profile-background-image-container">
                        <img src={this.props.src} alt={this.props.alt} className="profile-background-image" />
                        {this.props.locked ?
                            <div className="profile-background-image-locked">
                                <i className="fas fa-lock"></i>
                            </div>
                            : ""}
                    </div>
                </a>
            </div>
        )
    }
}

class ProfileSettingsModal extends MComponent {
    constructor(props) {
        super("PROFILESETTINGSMODAL", props)
        this.state = {aboutText: this.props.player().aboutText}
    }

    renderPacks() {
        // fucking retarded deepcopy :tada:
        const packs = JSON.parse(JSON.stringify(this.props.packs))
        // Take default pack first
        const containers = []
        let cards = []
        let key = 0
        cards.push(<div className="column is-12" key={key++}>
            <p className="modal-title is-size-6">DEFAULT</p>
        </div>)
        let cardCounter = 0
        packs["default"].forEach(bg => {
            cards.push(
                <div className="column is-4 is-paddingless-top" key={key++}>
                    <BackgroundCard src={bg.path} alt={bg.name} pack={bg.pack} name={bg.name}
                        backgroundMouseOver={this.props.backgroundMouseOver}
                        backgroundMouseOut={this.props.backgroundMouseOut}
                        backgroundOnClick={this.props.backgroundOnClick}
                    />
                </div>
            )
            ++cardCounter
        })
        let len = cardCounter % 3
        if(len !== 0) {
            for(let i = 0; i < len; i++) {
                cards.push(
                    <div className="column is-4" key={key++} />
                )
            }
        }
        containers.push(
            <div className="columns is-multiline" key={key++}>
                {cards}
            </div>
        )
        cards = []
        // Do the rest
        Object.keys(packs).filter(e => e !== "default").forEach(e => {
            const packLocked = this.props.player().ownedBackgroundPacks.filter(p => e === p).length === 0
            cards.push(<div className="column is-12" key={key++}>
                <p className="modal-title is-size-6">
                    {packLocked ? <span style={{marginRight: "0.5em"}}><i className="fas fa-lock" /></span> : ""}
                    {e.toUpperCase().replace("_", " ")}
                    {packLocked ? <span style={{marginLeft: "0.5em"}} className="has-text-primary">500 <i className="fab fa-bitcoin" /></span> : ""}
                </p>
            </div>)
            let counter = 0
            packs[e].forEach(bg => {
                cards.push(
                    <div className="column is-4 is-paddingless-top" key={key++}>
                        <BackgroundCard src={bg.path} alt={bg.name} pack={bg.pack} name={bg.name}
                            backgroundMouseOver={this.props.backgroundMouseOver}
                            backgroundMouseOut={this.props.backgroundMouseOut}
                            backgroundOnClick={this.props.backgroundOnClick}
                            locked={packLocked} />
                    </div>
                )
                ++counter
            })
            let len = counter % 3
            if(len !== 0) {
                for(let i = 0; i < len; i++) {
                    cards.push(
                        <div className="column is-4" key={key++} />
                    )
                }
            }
            containers.push(
                <div className="columns is-multiline" key={key++}>
                    {cards}
                </div>
            )
            cards = []
        })
        return containers
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isModalOpen()}
                onAfterOpen={this.props.afterOpenModal()}
                onRequestClose={() => {
                    // If we don't do this, stack overflow somehow.
                    // yeah idgi either :I
                    if(this.props.isModalOpen()) {
                        this.props.backgroundMouseOut()
                        this.props.closeModal()
                    }
                }}
                className="mewna-modal"
                overlayClassName="mewna-modal-overlay"
                ariaHideApp={false}>
                {/* ^^^ I have no fucking clue how to do this right ;-; */}
                <div className="modal-container">
                    <p className="is-size-4 has-text-white has-text-weight-semibold modal-header">
                        Profile Settings
                    </p>
                    <div className="modal-body">
                        <div>
                            <p className="modal-title">About</p>
                            <DebouncedTextarea maxChars={150} rows={3} min-rows={3} value={this.state.aboutText} callback={(e) => {
                                const val = e.textarea_value.replace(/\r?\n|\r/g, "")
                                axios.post(BACKEND_URL + `/api/v1/data/account/${this.props.player().id}/update`,
                                    {aboutText: val, id: this.props.player().id}, {headers: {"Authorization": this.getAuth().getToken()}})
                                    .then(e => {
                                        this.props.onAboutUpdate(val)
                                        this.setState({aboutText: this.props.player().aboutText})
                                    })
                            }} />
                        </div>
                        <br />
                        <div>
                            <p className="modal-title">Custom Background</p>
                            {this.renderPacks()}
                        </div>
                    </div>
                    <p className="modal-footer">
                        <a className="button is-primary hover is-size-6" onClick={this.props.closeModal}>
                            Finish
                        </a>
                    </p>
                </div>
            </Modal>
        )
    }
}

export class ProfilePage extends MComponent {
    constructor(props) {
        super("PROFILEPAGE", props)
        this.state = {settingsModalOpen: false, player: null, packs: null, background: null, user: null, invalid: false}
    }
    /*
        getAvatar() {
            const base = `https://cdn.discordapp.com/avatars/${this.state.user.id}`
            if(this.state.user && this.state.user.avatar) {
                const avatar = this.state.user.avatar
                if(avatar.startsWith("a_")) {
                    return `${base}/${avatar}.gif`
                } else {
                    return `${base}/${avatar}.png`
                }
            } else {
                const avatar = parseInt(this.state.user.discriminator, 10) % 5
                return `${base}/${avatar}.png`
            }
        }
    */
    renderEdit() {
        // TODO: LOL THIS IS WAY WRONG
        if(this.props.match.params.id === this.state.player.id) {
            return (
                <a className="button is-primary" onClick={() => this.setState({settingsModalOpen: true})}>Edit</a>
            )
        } else {
            return ""
        }
    }

    // Try to load the player until we have everything needed
    tryLoad() {
        setTimeout(() => {
            if(this.props.match.params.id) {
                axios.get(BACKEND_URL + `/api/v1/data/account/${this.props.match.params.id}/profile`).then(e => {
                    let data = JSON.parse(e.data)
                    this.getLogger().debug("fetched player =>", data)
                    if(data.error) {
                        // Probably an invalid thing, say something
                        this.setState({invalid: true})
                    } else {
                        this.setState({player: data, background: data.customBackground})
                    }
                })
                axios.get(BACKEND_URL + "/api/v1/metadata/backgrounds/packs").then(e => {
                    let data = e.data
                    this.getLogger().debug("fetched packs =>", data)
                    this.setState({packs: data})
                })
                /*
                axios.get(BACKEND_URL + "/api/v1/cache/user/" + this.props.match.params.id).then(e => {
                    let data = e.data
                    this.getLogger().debug("fetched cache =>", data)
                    this.setState({user: data})
                })
                */
            } else {
                this.tryLoad()
            }
        }, 100)
    }

    componentDidMount() {
        this.tryLoad()
    }

    render() {
        if(this.state.invalid) {
            return (
                <NotFound />
            )
        } else if(/*this.state.user && this.state.user.username && */this.state.player && this.state.packs) {
            const split = this.state.background.split("/")
            const thumbnail = split[0] + '/' + split[1] + '/thumbs/' + split[2]
            return (
                <div>
                    <div className="profile-background-section">
                        <ProgressiveImage
                            src={`${this.state.background}.png`}
                            placeholder={`${thumbnail}.png`}
                            style={{
                                width: "100%",
                                height: "100%",
                                backgroundSize: "cover",
                                backgroundPosition: "0% 35%"
                            }}
                        />
                    </div>
                    <div className="profile-top-bar">
                        <div className="container is-4em-h">
                            <div className="columns profile-column-container is-4em-h is-flex" style={{flexDirection: "row", alignItems: "center"}}>
                                <div className="column is-3 profile-column is-4em-h" />
                                <div className="column is-9 profile-column is-4em-h profile-top-bar-inner">
                                    {/*<a className="profile-header-link">Timeline</a>
                                    <a className="profile-header-link">More info</a>*/}
                                    <span style={{marginLeft: "auto", marginRight: "1em"}} />
                                    <div>
                                        {this.renderEdit()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <VHContainer>
                        <ProfileSettingsModal
                            isModalOpen={() => this.state.settingsModalOpen}
                            afterOpenModal={() => {}}
                            closeModal={() => {this.setState({settingsModalOpen: false})}}
                            packs={this.state.packs}
                            //user={this.state.user}
                            player={() => this.state.player}
                            onAboutUpdate={(text) => {
                                this.getLogger().debug("Update aboutText =>", text)
                                let player = Object.assign({}, this.state.player)
                                player.aboutText = text
                                this.setState({player: player})
                            }}
                            backgroundMouseOver={bg => {
                                if(this.state.player.customBackground !== bg) {
                                    this.setState({background: bg})
                                }
                            }}
                            backgroundMouseOut={() => {
                                if(this.state.background !== this.state.player.customBackground) {
                                    this.setState({background: this.state.player.customBackground})
                                }
                            }}
                            backgroundOnClick={(name, pack, src) => {
                                const bg = `${pack}/${name}`
                                axios.post(BACKEND_URL + `/api/v1/data/account/${this.state.player.id}/update`, 
                                    {customBackground: bg, id: this.state.player.id}, 
                                    {headers: {"Authorization": this.getAuth().getToken()}})
                                    .then(e => {
                                        this.getLogger().debug("Update customBackground =>", bg)
                                        let player = Object.assign({}, this.state.player)
                                        player.customBackground = src.replace(".png", "")
                                        this.setState({background: player.customBackground, player: player})
                                    })
                            }}
                        />
                        <div className="columns profile-column-container">
                            <div className="column is-3 profile-column profile-about-column">
                                <div>
                                    <img src={/*this.getAvatar()*/this.state.player.avatar} alt="avatar" className="profile-avatar" />
                                    <div className="profile-name">
                                        {this.state.player.displayName}<span style={{marginLeft: "0.25em"}} />
                                    </div>
                                    <hr className="dark-hr" />
                                    <p className="profile-about-text-title">About</p>
                                    {this.state.player.aboutText}<br />
                                    {/*
                                    <strong className="has-text-white">OTHER STATS:</strong><br />
                                    Will go here eventually I guess~
                                    */}
                                </div>
                            </div>
                            <div className="column is-12 is-hidden-tablet" />
                            <div className="column is-9 profile-column rounded-corners">
                                <div className="columns is-multiline">
                                    {/*
                                    <div className="column is-12 is-not-quite-black rounded-corners">
                                        <b>{this.state.user.name}</b> hasn't done anything notable yet...
                                    </div>
                                    */}
                                    <div className="column is-12 is-not-quite-black rounded-corners post-column is-flex flex-row">
                                        <span style={{marginRight: "0.25em"}}><i className="far fa-money-bill-alt"></i></span>
                                        <span><b>{this.state.player.displayName}</b> donated for the first time.</span>
                                        <span style={{marginLeft: "auto", marginRight: "0.5em"}} />
                                        <span>1 minute ago</span>
                                    </div>
                                    <div className="column is-12 is-not-quite-black rounded-corners post-column is-flex flex-row">
                                        <span style={{marginRight: "0.25em"}}><i className="fas fa-trophy"></i></span>
                                        <span><b>{this.state.player.displayName}</b> hit level 10 for the first time.</span>
                                        <span style={{marginLeft: "auto", marginRight: "0.5em"}} />
                                        <span>5 minutes ago</span>
                                    </div>
                                    <div className="column is-12 is-not-quite-black rounded-corners post-column is-flex flex-row">
                                        <span style={{marginRight: "0.25em"}}><i className="fas fa-trophy"></i></span>
                                        <span><b>{this.state.player.displayName}</b> hit level 1 for the first time.</span>
                                        <span style={{marginLeft: "auto", marginRight: "0.5em"}} />
                                        <span>29 minutes ago</span>
                                    </div>
                                    <div className="column is-12 is-not-quite-black rounded-corners post-column is-flex flex-row">
                                        <span style={{marginRight: "0.25em"}}><i className="fas fa-paint-brush"></i></span>
                                        <span><b>{this.state.player.displayName}</b> changed their background for the first time.</span>
                                        <span style={{marginLeft: "auto", marginRight: "0.5em"}} />
                                        <span>30 minutes ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </VHContainer>
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

function mapStateToProps(state) {
    return {
        user: state.user
    }
}

export const ProfilePageRedux = connect(mapStateToProps)(ProfilePage)
