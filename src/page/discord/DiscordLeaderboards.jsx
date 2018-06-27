import {MComponent} from "../../MComponent"
import React from "react"
import BubblePreloader from 'react-bubble-preloader'
import axios from 'axios'
import {BACKEND_URL} from "../../const"
import {VHContainer} from "../VHContainer"
import {Icon} from '../../comp/Icon'
import {GuildHeader} from "../../comp/GuildHeader";

export class DiscordLeaderboards extends MComponent {
    constructor(props) {
        super("DISCORDLEADERBOARDS", props)
        this.state = {guild: null, data: null}
    }

    componentDidMount() {
        axios.get(BACKEND_URL + `/api/v1/cache/guild/${this.props.match.params.id}`).then(e => {
            const data = e.data
            this.setState({guild: data})
        })
        axios.get(BACKEND_URL + `/api/v1/data/guild/${this.props.match.params.id}/levels`).then(e => {
            const data = e.data
            this.setState({data: data})
        })
    }

    renderProgressBars() {
        let cards = []
        let key = 0;
        this.state.data.forEach(e => {
            cards.push(
                <div key={key++} className="column is-12 rounded-corners leaderboards-card" style={{background: `url("${e.customBackground}.png")`}}>
                    <div className="leaderboards-card-panel" />
                    <div className="leaderboards-card-content">
                        <Icon src={e.avatar} className={"guild-icon leaderboards-icon"} />
                        <div className="leaderboards-rank">
                            #{e.playerRank}
                        </div>
                        <div className="leaderboards-username">
                            {e.name}<span className="leaderboards-discrim">#{e.discrim}</span>
                        </div>
                        <div className="leaderboards-xp-container">
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{width: `${((e.userXp - e.currentLevelXp) / (e.nextLevelXp - e.currentLevelXp)) * 100}%`}} />
                                <div className="progress-text">
                                    {e.nextLevelXp - e.xpNeeded} / {e.nextLevelXp} EXP
                                </div>
                            </div>
                        </div>
                        <div className="leaderboards-numbers">
                            <div className="leaderboards-level">
                                LEVEL
                            </div>
                            <div className="leaderboards-level-number">
                                {e.userLevel}
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
        return cards
    }

    render() {
        if(this.state.guild && this.state.data) {
            return (
                <div>
                    <GuildHeader guild={this.state.guild} titleExtra=" Leaderboards">
                        {/*
                        <a className="profile-header-link">Rankings</a>
                        <a className="profile-header-link">Role Rewards</a>
                        */}
                    </GuildHeader>
                    <VHContainer>
                        <div className={"columns has-text-centered is-centered is-paddingless is-marginless"}>
                            <div className="column is-10">
                                <div className={"columns is-multiline is-paddingless is-marginless is-centered has-text-centered card-columns"}>
                                    {this.renderProgressBars()}
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
