import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMonitoringService } from '@/lib/monitoring'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'current'
    const hours = parseInt(searchParams.get('hours') || '1')

    const monitoring = getMonitoringService()

    switch (action) {
      case 'current':
        const currentMetrics = monitoring.getLatestMetrics()
        return NextResponse.json({
          success: true,
          metrics: currentMetrics,
          healthScore: monitoring.getHealthScore(),
          isHealthy: monitoring.isHealthy()
        })

      case 'history':
        const historyMetrics = monitoring.getMetricsHistory(hours)
        return NextResponse.json({
          success: true,
          metrics: historyMetrics,
          period: `${hours} hours`
        })

      case 'alerts':
        const showAll = searchParams.get('all') === 'true'
        const alerts = showAll ? monitoring.getAllAlerts() : monitoring.getActiveAlerts()
        return NextResponse.json({
          success: true,
          alerts,
          count: alerts.length
        })

      case 'health-summary':
        return NextResponse.json({
          success: true,
          healthScore: monitoring.getHealthScore(),
          isHealthy: monitoring.isHealthy(),
          activeAlerts: monitoring.getActiveAlerts().length,
          criticalAlerts: monitoring.getActiveAlerts().filter(a => a.type === 'critical').length,
          warningAlerts: monitoring.getActiveAlerts().filter(a => a.type === 'warning').length
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { action, alertId } = body

    const monitoring = getMonitoringService()

    switch (action) {
      case 'resolve-alert':
        if (!alertId) {
          return NextResponse.json(
            { error: 'Alert ID required' },
            { status: 400 }
          )
        }

        const resolved = monitoring.resolveAlert(alertId)
        if (!resolved) {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          )
        }

        logger.info(`Alert resolved by admin ${session.user.id}`, { alertId })
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully'
        })

      case 'reset-counters':
        monitoring.resetPerformanceCounters()
        logger.info(`Performance counters reset by admin ${session.user.id}`)
        return NextResponse.json({
          success: true,
          message: 'Performance counters reset'
        })

      case 'collect-metrics':
        const metrics = await monitoring.collectMetrics()
        return NextResponse.json({
          success: true,
          metrics,
          message: 'Metrics collected successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Error processing monitoring action:', error)
    return NextResponse.json(
      { error: 'Failed to process monitoring action' },
      { status: 500 }
    )
  }
}