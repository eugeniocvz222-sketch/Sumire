import React from 'react'
import { useApp } from '../../context/AppContext'
import { COLOR_SCHEMES } from '../common/ColorMap'
import { IconRenderer } from '../common/IconRenderer'
import { Award, CheckCircle2, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react'
import { MinimalBackground } from '../reactbits/MinimalBackground'

export const GradesView: React.FC = () => {
  const { filteredSubjects, grades, updateGrade, activePeriod } = useApp()

  const calculateAverage = (g: any) => {
    const scores: number[] = []
    if (g?.partial1 !== undefined && !isNaN(g.partial1)) scores.push(Number(g.partial1))
    if (g?.partial2 !== undefined && !isNaN(g.partial2)) scores.push(Number(g.partial2))
    if (g?.partial3 !== undefined && !isNaN(g.partial3)) scores.push(Number(g.partial3))
    if (g?.project !== undefined && !isNaN(g.project)) scores.push(Number(g.project))

    if (scores.length === 0) return null
    const sum = scores.reduce((a, b) => a + b, 0)
    return (sum / scores.length).toFixed(1)
  }

  // Calculate overall GPA
  const averages = filteredSubjects
    .map((s) => {
      const g = grades.find((gr) => gr.subjectId === s.id)
      const avg = calculateAverage(g)
      return avg ? parseFloat(avg) : null
    })
    .filter((a): a is number => a !== null)

  const overallGPA =
    averages.length > 0
      ? (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(1)
      : null

  return (
    <div className="relative flex-1 overflow-y-auto p-6 md:p-8 bg-[#030306]">
      <MinimalBackground />
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Control de Calificaciones • {activePeriod?.name || 'Cuatrimestre'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Calificaciones y Promedios</h1>
            <p className="text-xs text-slate-400">
              Registra tus notas de parciales y proyectos para monitorear tu promedio
            </p>
          </div>

          {/* Overall GPA Card */}
          {overallGPA && (
            <div className="px-6 py-3.5 bg-linear-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl">
                {overallGPA}
              </div>
              <div>
                <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Promedio General
                </div>
                <div className="text-[11px] text-slate-400">
                  {parseFloat(overallGPA) >= 8.0 ? '¡Excelente rendimiento!' : 'Rendimiento regular'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grades Table / Cards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-4">Materia</th>
                  <th className="p-4 text-center">Parcial 1</th>
                  <th className="p-4 text-center">Parcial 2</th>
                  <th className="p-4 text-center">Parcial 3</th>
                  <th className="p-4 text-center">Proyecto / Lab</th>
                  <th className="p-4 text-center">Promedio</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSubjects.map((sub) => {
                  const g = grades.find((gr) => gr.subjectId === sub.id)
                  const avg = calculateAverage(g)
                  const isPassing = avg ? parseFloat(avg) >= 7.0 : true
                  const scheme = COLOR_SCHEMES[sub.color] || COLOR_SCHEMES.emerald

                  return (
                    <tr key={sub.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${scheme.badgeBg} ${scheme.accentColor}`}
                          >
                            <IconRenderer icon={sub.icon} className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs leading-snug">{sub.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.code}</div>
                          </div>
                        </div>
                      </td>

                      {/* Parcial 1 Input */}
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={g?.partial1 ?? ''}
                          onChange={(e) =>
                            updateGrade(sub.id, {
                              partial1: e.target.value === '' ? undefined : parseFloat(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center text-white font-bold focus:outline-hidden focus:border-indigo-500 text-xs"
                        />
                      </td>

                      {/* Parcial 2 Input */}
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={g?.partial2 ?? ''}
                          onChange={(e) =>
                            updateGrade(sub.id, {
                              partial2: e.target.value === '' ? undefined : parseFloat(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center text-white font-bold focus:outline-hidden focus:border-indigo-500 text-xs"
                        />
                      </td>

                      {/* Parcial 3 Input */}
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={g?.partial3 ?? ''}
                          onChange={(e) =>
                            updateGrade(sub.id, {
                              partial3: e.target.value === '' ? undefined : parseFloat(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center text-white font-bold focus:outline-hidden focus:border-indigo-500 text-xs"
                        />
                      </td>

                      {/* Proyecto Input */}
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          placeholder="-"
                          value={g?.project ?? ''}
                          onChange={(e) =>
                            updateGrade(sub.id, {
                              project: e.target.value === '' ? undefined : parseFloat(e.target.value),
                            })
                          }
                          className="w-14 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center text-white font-bold focus:outline-hidden focus:border-indigo-500 text-xs"
                        />
                      </td>

                      {/* Promedio Column */}
                      <td className="p-4 text-center">
                        <span
                          className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                            avg
                              ? isPassing
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                              : 'text-slate-500'
                          }`}
                        >
                          {avg ?? 'Pendiente'}
                        </span>
                      </td>

                      {/* Estado Badge */}
                      <td className="p-4 text-center">
                        {avg ? (
                          isPassing ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Aprobatoria
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3" /> En Riesgo
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-500">En curso</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
