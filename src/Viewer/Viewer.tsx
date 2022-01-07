import { Button, Tab, Tabs } from "@blueprintjs/core";
import React from "react";
import { Debugger } from "./DebugView";
import { Options, OptionsProp } from "./Options";
import AutoSizer from "react-virtualized-auto-sizer"

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
  sim_duration: SummaryStats;
  ele_uptime: { [key: number]: SummaryStats }[];
  required_er: number[];
  damage: SummaryStats;
  dps: SummaryStats;
  dps_by_target: { [key: number]: SummaryStats };
  damage_over_time: { [key: string]: SummaryStats };
  iter: number;
  text: string;
  debug: string;
  runtime: number;
  config_file: string;
  num_targets: number;
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
        In total, the team did{" "}
        <strong className="text-gray-100">
          {data.dps.mean.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </strong>{" "}
        damage per second to {data.num_targets} targets (on average, over{" "}
        {data.iter} iterations [min:{" "}
        {data.dps.min.toLocaleString(undefined, { maximumFractionDigits: 2 })},
        max:{" "}
        {data.dps.max.toLocaleString(undefined, { maximumFractionDigits: 2 })},
        std dev:{" "}
        {data.dps.sd?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        ]), over the course of{" "}
        {data.sim_duration.mean.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}{" "}
        seconds. The simulation took {(data.runtime / 1000000000).toFixed(3)}{" "}
        seconds.
      </div>
      <div className="m-2 p-2 rounded-md bg-gray-600">
        <pre className="whitespace-pre-wrap">{data.text}</pre>
      </div>
    </div>
  );
}

function Config({ data }: { data: SimResults }) {
  return (
    <div>
      <div className="m-2 p-2 rounded-md bg-gray-600">
        <pre className="whitespace-pre-wrap">{data.config_file}</pre>
      </div>
    </div>
  );
}

type ViewerProps = {
  data: string;
  names?: string;
  handleClose: () => void;
};

const opts = [
  "procs",
  "damage",
  "pre_damage_mods",
  "hurt",
  "heal",
  "calc",
  "reaction",
  "element",
  "snapshot",
  "snapshot_mods",
  "status",
  "action",
  "queue",
  "energy",
  "character",
  "enemy",
  "hook",
  "sim",
  "task",
  "artifact",
  "weapon",
  "shield",
  "construct",
  "icd",
];

const defOpts = [
  "damage",
  "element",
  "action",
  "energy",
  "pre_damage_mods",
  "snapshot_mods",
];

export function Viewer(props: ViewerProps) {
  const [tabID, setTabID] = React.useState<string>("result");
  const [optOpen, setOptOpen] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<string[]>(defOpts);
  const handleTabChange = (next: string) => {
    setTabID(next);
  };

  let data: SimResults = JSON.parse(props.data);

  const optProps: OptionsProp = {
    isOpen: optOpen,
    handleClose: () => {
      setOptOpen(false);
    },
    handleToggle: (t: string) => {
      const i = selected.indexOf(t);
      let next = [...selected];
      if (i === -1) {
        next.push(t);
      } else {
        next.splice(i, 1);
      }
      setSelected(next);
    },
    handleClear: () => {
      setSelected([]);
    },
    handleResetDefault: () => {
      setSelected(defOpts);
    },
    selected: selected,
    options: opts,
  };

  let active: JSX.Element = <div>Nothing here</div>;
  switch (tabID) {
    case "result":
      active = <TextSummary data={data} />;
      break;
    case "config":
      active = <Config data={data} />;
      break;
    case "debug":
      active = (
        <Debugger
          log={data.debug}
          active={data.active_char}
          team={data.char_names}
          selected={selected}
        />
      );
  }

  return (
    <div
      className={props.names + " pb-4 rounded-lg bg-gray-800 flex flex-col"}
      
    >
      <div className="flex flex-row sticky top-0 bg-gray-800 rounded-tl-lg rounded-tr-lg pt-4 pl-4 pr-4  pb-2">
        <Tabs animate large selectedTabId={tabID} onChange={handleTabChange}>
          <Tab id="result" title="Summary" />
          <Tab id="graphs" title="Graphs" />
          <Tab id="config" title="Config" />
          <Tab id="debug" title="Debug" />
        </Tabs>

        <div className="ml-auto">
          <Button
            className="mr-2"
            icon="cog"
            onClick={() => {
              setOptOpen(true);
            }}
          />
          <Button icon="cross" intent="danger" onClick={props.handleClose} />
        </div>
      </div>

      <div className="mt-2 grow overflow-y-auto" id="scroll-target">
      <AutoSizer>
          {
              ({height, width}) => (
                <div style={{height: height, width: width-25}}>
                    {active}
                </div>
              )
          }
      </AutoSizer>
      </div>

      
      <Options {...optProps} />
    </div>
  );
}
