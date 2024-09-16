import {useQuery} from "@tanstack/react-query";
import shareService from "@/api/services/shareService.ts";
import {useTranslation} from "react-i18next";
import useChart from "@/components/chart/useChart.ts";
import {Modal, Spin} from "antd";
import Chart from "@/components/chart/chart.tsx";

export type ShareInfoModalProps = {
  accountId: number;
  onOk: VoidFunction;
  show: boolean;
};

export function ShareInfoModal({ accountId, onOk, show }: ShareInfoModalProps) {
  const { data: statistic, isLoading } = useQuery({
    queryKey: ['shareInfo', accountId],
    queryFn: () => shareService.getShareStatistic(accountId),
    enabled: show,
  });

  const { t } = useTranslation();

  const chartOptions = useChart({
    legend: {
      horizontalAlign: 'center',
    },
    stroke: {
      show: true,
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    xaxis: {
      categories: statistic?.categories || [],
    },
    tooltip: {
      fillSeriesColor: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <Modal title={t('token.statistic') + "(00:00 ~ 23:59)"} open={show} onOk={onOk} closable={false} onCancel={onOk}>
      <Spin spinning={isLoading} tip={t('token.queryingInfo')}>
        <Chart type="bar" series={statistic?.series || []} options={chartOptions} height={320} />
      </Spin>
    </Modal>
  );
}
