import { Button, Tab, Tabs } from "@blueprintjs/core";
import React from "react";
import { Debugger } from "./DebugView";
import { Graphs } from "./Graphs";
import { Options, OptionsProp } from "./Options";
import { DebugRow, parseLog } from "./parse";

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

type ViewProps = {
  classes?: string;
  selected: string[];
  handleSetSelected: (next: string[]) => void;
  data: SimResults;
  parsed: DebugRow[];
  handleClose: () => void;
};

function ViewOnly(props: ViewProps) {
  const [tabID, setTabID] = React.useState<string>("result");
  const [optOpen, setOptOpen] = React.useState<boolean>(false);

  const handleTabChange = (next: string) => {
    if (next === "settings") {
      setOptOpen(true);
      return;
    }
    setTabID(next);
  };

  const optProps: OptionsProp = {
    isOpen: optOpen,
    handleClose: () => {
      setOptOpen(false);
    },
    handleToggle: (t: string) => {
      const i = props.selected.indexOf(t);
      let next = [...props.selected];
      if (i === -1) {
        next.push(t);
      } else {
        next.splice(i, 1);
      }
      props.handleSetSelected(next);
    },
    handleClear: () => {
      props.handleSetSelected([]);
    },
    handleResetDefault: () => {
      props.handleSetSelected(defOpts);
    },
    selected: props.selected,
    options: opts,
  };

  return (
    <div
      className={props.classes + " p-4 rounded-lg bg-gray-800 flex flex-col"}
    >
      <div className="flex flex-row  bg-gray-800 w-full">
        <Tabs
          selectedTabId={tabID}
          onChange={handleTabChange}
          className="w-full"
        >
          <Tab id="result" title="Summary" className="focus:outline-none" />
          <Tab id="graphs" title="Graphs" className="focus:outline-none" />
          <Tab id="config" title="Config" className="focus:outline-none" />
          <Tab id="debug" title="Debug" className="focus:outline-none" />
          <Tab id="settings" title="Settings" className="focus:outline-none" />
          <Tabs.Expander />
          <Button icon="cross" intent="danger" onClick={props.handleClose} />
        </Tabs>
      </div>

      <div className="mt-2 grow">
        {
          {
            result: <TextSummary data={props.data} />,
            config: <Config data={props.data} />,
            debug: (
              <Debugger data={props.parsed} team={props.data.char_names} />
            ),
            graphs: <Graphs data={props.data} />,
          }[tabID]
        }
      </div>

      <Options {...optProps} />
    </div>
  );
}

export function Viewer(props: ViewerProps) {
  const [selected, setSelected] = React.useState<string[]>(defOpts);

  let data: SimResults = JSON.parse(props.data);

  const parsed = parseLog(
    data.active_char,
    data.char_names,
    data.debug,
    selected
  );

  const handleSetSelected = (next: string[]) => {
    setSelected(next);
  };

  let viewProps = {
    classes: props.names,
    selected: selected,
    handleSetSelected: handleSetSelected,
    data: data,
    parsed: parsed,
    handleClose: props.handleClose,
  };

  return <ViewOnly {...viewProps} />;
}
