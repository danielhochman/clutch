import React from "react";
import { Button, client, Confirmation, MetadataTable, useWizardContext } from "@clutch-sh/core";
import { useDataLayout } from "@clutch-sh/data-layout";
import { Wizard, WizardStep } from "@clutch-sh/wizard";
import { Grid } from "@material-ui/core";
import * as yup from "yup";

const ClusterPairTargetDetails = () => {
  const { onSubmit } = useWizardContext();
  const clusterPairData = useDataLayout("clusterPairTargetData");
  const clusterPair = clusterPairData.displayValue();
  const update = (key, value) => {
    clusterPairData.updateData(key, value);
  };

  return (
    <WizardStep error={clusterPairData.error}>
      <MetadataTable
        onUpdate={update}
        data={[
          {
            name: "Downstream Cluster",
            value: clusterPair.downstreamCluster,
            input: {
              type: "string",
              key: "downstreamCluster",
            },
          },
          {
            name: "Upstream Cluster",
            value: clusterPair.upstreamCluster,
            input: {
              type: "string",
              key: "upstreamCluster",
            },
          },
        ]}
      />
      <Grid container justify="center">
        <Button text="Next" destructive onClick={onSubmit} />
      </Grid>
    </WizardStep>
  );
};

const AbortExperimentDetails = () => {
  const { onSubmit, onBack } = useWizardContext();
  const abortExperimentData = useDataLayout("abortExperimentData");
  const abortExperiment = abortExperimentData.displayValue();
  const update = (key, value) => {
    abortExperimentData.updateData(key, value);
  };

  return (
    <WizardStep error={abortExperimentData.error}>
      <MetadataTable
        onUpdate={update}
        data={[
          {
            name: "Percent",
            value: abortExperiment.percent,
            input: {
              type: "number",
              key: "percent",
              validation: yup.number().integer().moreThan(-1).lessThan(101),
            },
          },
          {
            name: "HTTP Status",
            value: abortExperiment.httpStatus,
            input: {
              type: "number",
              key: "httpStatus",
              validation: yup.number().integer().moreThan(99).lessThan(600),
            },
          },
        ]}
      />
      <Grid container justify="center">
        <Button text="Back" onClick={onBack} />
        <Button text="Next" destructive onClick={onSubmit} />
      </Grid>
    </WizardStep>
  );
};

const LatencyExperimentDetails = () => {
  const { onSubmit, onBack } = useWizardContext();
  const latencyExperimentData = useDataLayout("latencyExperimentData");
  const latencyExperiment = latencyExperimentData.displayValue();
  const update = (key, value) => {
    latencyExperimentData.updateData(key, value);
  };

  return (
    <WizardStep error={latencyExperimentData.error}>
      <MetadataTable
        onUpdate={update}
        data={[
          {
            name: "Percent",
            value: latencyExperiment.percent,
            input: {
              type: "number",
              key: "percent",
              validation: yup.number().integer().moreThan(-1).lessThan(101),
            },
          },
          {
            name: "Latency (ms)",
            value: latencyExperiment.latency,
            input: {
              type: "number",
              key: "latency",
              validation: yup.number().integer().moreThan(0),
            },
          },
        ]}
      />
      <Grid container justify="center">
        <Button text="Back" onClick={onBack} />
        <Button text="Next" destructive onClick={onSubmit} />
      </Grid>
    </WizardStep>
  );
};

const Confirm = () => {
  const startData = useDataLayout("startData");

  return (
    <WizardStep error={startData.error} isLoading={startData.isLoading}>
      <Confirmation action="Start" />
    </WizardStep>
  );
};

export const StartAbortExperiment = ({ heading }) => {
  const dataLayout = {
    clusterPairTargetData: {},
    abortExperimentData: {},
    latencyExperimentData: {},
    startData: {
      deps: ["clusterPairTargetData", "abortExperimentData", "latencyExperimentData"],
      hydrator: (clusterPairTargetData, abortExperimentData) => {
        return client.post("/v1/experiments/create", {
          experiments: [
            {
              testSpecification: {
                abort: {
                  clusterPair: {
                    downstreamCluster: clusterPairTargetData.downstreamCluster,
                    upstreamCluster: clusterPairTargetData.upstreamCluster,
                  },
                  percent: abortExperimentData.percent,
                  httpStatus: abortExperimentData.httpStatus,
                },
              },
            },
          ],
        });
      },
    },
  };

  return (
    <Wizard dataLayout={dataLayout} heading={heading}>
      <ClusterPairTargetDetails name="target" />
      <AbortExperimentDetails name="abort" />
      <Confirm name="Confirmation" />
    </Wizard>
  );
};

export const StartLatencyExperiment = ({ heading }) => {
  const dataLayout = {
    clusterPairTargetData: {},
    abortExperimentData: {},
    latencyExperimentData: {},
    startData: {
      deps: ["clusterPairTargetData", "abortExperimentData", "latencyExperimentData"],
      hydrator: (clusterPairTargetData, abortExperimentData, latencyExperimentData) => {
        return client.post("/v1/experiments/create", {
          experiments: [
            {
              testSpecification: {
                abort: {
                  clusterPair: {
                    downstreamCluster: clusterPairTargetData.downstreamCluster,
                    upstreamCluster: clusterPairTargetData.upstreamCluster,
                  },
                  percent: abortExperimentData.percent,
                  latency: latencyExperimentData.latency,
                },
              },
            },
          ],
        });
      },
    },
  };

  return (
    <Wizard dataLayout={dataLayout} heading={heading}>
      <ClusterPairTargetDetails name="target" />
      <LatencyExperimentDetails name="latency" />
      <Confirm name="Confirmation" />
    </Wizard>
  );
};
