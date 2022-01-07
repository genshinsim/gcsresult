import { Alignment, Button, Navbar, Tab, Tabs } from "@blueprintjs/core";
import React from "react";
// import styled from "styled-components";

// const Content = styled.div`
//   height: 100%;
//   width: 100%;
// `;

// const Body = styled.div`
//   margin-top: 50px;
// `;


/**
 * 	IsDamageMode          bool                            
    ActiveChar            string
CharNames[]string
DamageByChar[]map[string]FloatResult
DamageInstancesByChar[]map[string]IntResult
DamageByCharByTargets[]map[int]FloatResult
CharActiveTime[]IntResult
AbilUsageCountByChar[]map[string]IntResult          
    ParticleCount         map[string]IntResult            
    ReactionsTriggered    map[core.ReactionType]IntResult 
    Duration              FloatResult
ElementUptime[]map[core.EleType]IntResult
RequiredER[]float64                       
    Damage         FloatResult            
    DPS            FloatResult            
    DPSByTarget    map[int]FloatResult    
    DamageOverTime map[string]FloatResult 
    Iterations     int                    
    Text           string                 
    Debug          string                 
    Runtime        time.Duration
 */


export interface SimResults {
    is_damage_mode: boolean;
    active_char: string;
    char_names: string[];
    damage_by_char: { [key: string]: SummaryStats }[];
    damage_instances_by_char: { [key: string]: SummaryStats }[];
    damage_by_char_by_targets: { [key: number]: SummaryStats }[];
    char_active_time: SummaryStats[];
    abil_usage_count_by_char: { [key: string]: SummaryStats }[];
    particle_count: { [key: string]: SummaryStats };
    reactions_triggered: { [key: string]: SummaryStats }[];
    sim_duration: SummaryStats
    ele_uptime: { [key: number]: SummaryStats }[];
    required_er: number[];
    damage: SummaryStats
    dps: SummaryStats
    dps_by_target: { [key: number]: SummaryStats }
    damage_over_time: { [key: string]: SummaryStats }
    iter: number
    text: string
    debug: string
    runtime: number
    config_file: string
    num_targets: number
}

export interface SummaryStats {
    mean: number;
    min: number;
    max: number;
    sd?: number;
}


function TextSummary({ data }: { data: SimResults }) {
    return (
        <div>
            <div className="m-2 p-2 rounded-md bg-gray-600">


                In total, the team did <strong className="text-gray-100"
                >{data.dps.mean.toFixed(2)}</strong> damage per second to {data.num_targets} targets (on average, over {data.iter} iterations [min:{" "}
                {data.dps.min.toFixed(2)}, max: {data.dps.max.toFixed(2)}, std dev:{" "}
                {data.dps.sd?.toFixed(2)}]), over the course of{" "}
                {data.sim_duration.mean.toFixed(2)} seconds. The simulation took {(
                    data.runtime / 1000000000
                ).toFixed(3)} seconds.

            </div>
            <div className="m-2 p-2 rounded-md bg-gray-600">
                <pre className="whitespace-pre-wrap">
                    {data.text}
                </pre>
            </div>
        </div>
    )
}

function Config({ data }: { data: SimResults }) {
    return (
        <div>
            <div className="m-2 p-2 rounded-md bg-gray-600">
                <pre className="whitespace-pre-wrap">
                    {data.config_file}
                </pre>
            </div>
        </div>
    )
}

type ViewerProps = {
    data: string
    names?: string
    handleClose: () => void
}

export function Viewer(props: ViewerProps) {

    const [tabID, setTabID] = React.useState<string>("result")
    const handleTabChange = (next: string) => {
        setTabID(next)
    }

    let data: SimResults = JSON.parse(props.data)

    let active: JSX.Element = <div>Nothing here</div>

    switch (tabID) {
        case "result":
            active = <TextSummary data={data} />
            break;
        case "config":
            active = <Config data={data} />
            break;
    }

    return (
        <div className={props.names}>
            <div className="flex flex-row">
                <Tabs animate large selectedTabId={tabID} onChange={handleTabChange}>
                    <Tab id="result" title="Results" />
                    <Tab id="graphs" title="Graphs" />
                    <Tab id="config" title="Config" />
                    <Tab id="debug" title="Debug" />
                </Tabs>
                <div className="grow flex place-content-end">
                    <div>
                        <Button icon="cross" onClick={props.handleClose} />
                    </div>
                </div>
            </div>
            <div className="mt-2">
                {active}
            </div>
        </div>
    );
}
